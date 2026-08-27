# -*- coding: utf-8 -*-
"""
Join temporal ETR × Rotas Associadas
Atualização 26-08-2026 — Duque de Caxias / coleta Estevão

Regras de janela
----------------
1. Se o veículo permanecer no polígono "Garagem da Estevão" (campo Name)
   por pelo menos 1 hora:
   - COLETA (peso do próximo tíquete): último ponto na garagem → Entrada ETR
   - ETR_GARAGEM (sem peso, sem N_Operacao): Saída ETR → entrada na garagem
   - GARAGEM (sem peso): permanência no polígono da garagem (≥ 1 h)

2. Se não houver parada ≥ 1 h na garagem entre a saída anterior e a
   entrada atual:
   - COLETA: Saída da pesagem anterior → Entrada da pesagem atual
     (primeira pesagem sem garagem: Entrada − 12 h)

3. Depois da última pesagem, se houver parada ≥ 1 h na garagem:
   - ETR_GARAGEM: Saída ETR → entrada na garagem
   - GARAGEM: permanência

4. Pontos fora de qualquer janela: SEM_CLASSIFICACAO

Parâmetros ajustáveis no bloco abaixo.
"""

from qgis.core import (
    QgsVectorLayer, QgsProject, QgsFeature, QgsField,
    QgsVectorFileWriter
)
from qgis.PyQt.QtCore import QVariant, QDate, QTime, QDateTime
from qgis.PyQt.QtWidgets import QFileDialog
from collections import defaultdict
from datetime import datetime, timedelta, time as dtime
import os


# ---------------------------------------------------------------------------
# Parâmetros
# ---------------------------------------------------------------------------
NOME_GARAGEM = "Garagem da Estevão"
DURACAO_MINIMA_GARAGEM = timedelta(hours=1)
GAP_MAX_CLUSTER_GARAGEM = timedelta(minutes=30)
MARGEM_PRIMEIRA_PESAGEM = timedelta(hours=12)


def to_datetime(data_val, hora_val):
    """Converte QDate/QTime/string para datetime Python."""
    if data_val is None or hora_val is None:
        return None
    try:
        if isinstance(data_val, QDate):
            d = data_val.toPyDate()
        elif isinstance(data_val, datetime):
            d = data_val.date()
        elif isinstance(data_val, str):
            d = None
            for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y"):
                try:
                    d = datetime.strptime(str(data_val)[:10], fmt).date()
                    break
                except ValueError:
                    continue
            if d is None:
                return None
        else:
            return None

        if isinstance(hora_val, QTime):
            t = hora_val.toPyTime()
        elif isinstance(hora_val, dtime):
            t = hora_val
        elif isinstance(hora_val, str):
            t = None
            for fmt in ("%H:%M:%S", "%H:%M"):
                try:
                    t = datetime.strptime(str(hora_val), fmt).time()
                    break
                except ValueError:
                    continue
            if t is None:
                return None
        else:
            return None

        return datetime.combine(d, t)
    except Exception:
        return None


def eh_garagem(nome):
    if not nome:
        return False
    return str(nome).strip().lower() == NOME_GARAGEM.lower()


def clusterizar_paradas_garagem(pontos_dt):
    """
    pontos_dt: lista de datetime de pontos no polígono da garagem.
    Agrupa pontos com gap ≤ 30 min. Retorna só clusters com duração ≥ 1 h.
    """
    if not pontos_dt:
        return []

    pts = sorted(pontos_dt)
    clusters = []
    ini = fim = pts[0]

    for dt in pts[1:]:
        if dt - fim <= GAP_MAX_CLUSTER_GARAGEM:
            fim = dt
        else:
            clusters.append((ini, fim))
            ini = fim = dt
    clusters.append((ini, fim))

    stays = []
    for ini, fim in clusters:
        dur = fim - ini
        if dur >= DURACAO_MINIMA_GARAGEM:
            stays.append({"inicio": ini, "fim": fim, "duracao": dur})
    return stays


def stay_entre(stays, apos, antes):
    """Última parada ≥ 1 h com fim em (apos, antes)."""
    candidatos = []
    for s in stays:
        if s["fim"] >= antes:
            continue
        if apos is not None and s["fim"] <= apos:
            continue
        candidatos.append(s)
    if not candidatos:
        return None
    return max(candidatos, key=lambda s: s["fim"])


def montar_intervalos(pesagens, stays):
    """Constrói intervalos classificados para uma placa."""
    intervalos = []
    prev_saida = None

    for pes in pesagens:
        stay = stay_entre(stays, prev_saida, pes["dt_entrada"])

        if stay is not None:
            if prev_saida is not None and prev_saida < stay["inicio"]:
                intervalos.append({
                    "inicio": prev_saida,
                    "fim": stay["inicio"],
                    "tipo": "ETR_GARAGEM",
                    "pes": None
                })
            if stay["inicio"] < stay["fim"]:
                intervalos.append({
                    "inicio": stay["inicio"],
                    "fim": stay["fim"],
                    "tipo": "GARAGEM",
                    "pes": None
                })
            if stay["fim"] <= pes["dt_entrada"]:
                intervalos.append({
                    "inicio": stay["fim"],
                    "fim": pes["dt_entrada"],
                    "tipo": "COLETA",
                    "pes": pes
                })
        else:
            inicio = prev_saida if prev_saida is not None else (
                pes["dt_entrada"] - MARGEM_PRIMEIRA_PESAGEM
            )
            intervalos.append({
                "inicio": inicio,
                "fim": pes["dt_entrada"],
                "tipo": "COLETA",
                "pes": pes
            })

        prev_saida = pes["dt_saida"] or pes["dt_entrada"]

    # Depois da última pesagem: ETR → garagem, se houver parada ≥ 1 h
    if prev_saida is not None:
        stay_pos = stay_entre(stays, prev_saida, prev_saida + timedelta(days=3))
        if stay_pos is not None:
            if prev_saida < stay_pos["inicio"]:
                intervalos.append({
                    "inicio": prev_saida,
                    "fim": stay_pos["inicio"],
                    "tipo": "ETR_GARAGEM",
                    "pes": None
                })
            intervalos.append({
                "inicio": stay_pos["inicio"],
                "fim": stay_pos["fim"],
                "tipo": "GARAGEM",
                "pes": None
            })

    intervalos.sort(key=lambda x: x["inicio"])
    return intervalos


def classificar_ponto(dt_ponto, intervalos):
    if dt_ponto is None:
        return None
    for iv in intervalos:
        if iv["inicio"] <= dt_ponto <= iv["fim"]:
            return iv
    return None


# ============================================================
# Interface
# ============================================================
caminho_etr, _ = QFileDialog.getOpenFileName(
    None, "Selecione a tabela ETR (Estevao_Coleta_....geojson)", "",
    "GeoJSON (*.geojson)"
)
caminho_rotas, _ = QFileDialog.getOpenFileName(
    None, "Selecione Rotas Associadas (....geojson)", "",
    "GeoJSON (*.geojson)"
)

if not caminho_etr or not caminho_rotas:
    print("Arquivos não selecionados.")
else:
    etr = QgsVectorLayer(caminho_etr, "ETR", "ogr")
    rotas = QgsVectorLayer(caminho_rotas, "Rotas", "ogr")

    if not etr.isValid() or not rotas.isValid():
        print("Erro ao carregar uma das camadas.")
    else:
        print(f"ETR: {etr.featureCount():,} registros")
        print(f"Rotas: {rotas.featureCount():,} feições")

        etr_por_placa = defaultdict(list)
        for feat in etr.getFeatures():
            placa = feat["Placa"]
            if not placa:
                continue
            dt_entrada = to_datetime(feat["Entrada"], feat["Hora Entrada"])
            dt_saida = to_datetime(feat["Saida"], feat["Hora Saida"])
            if dt_entrada is None:
                continue
            etr_por_placa[str(placa).strip().upper()].append({
                "dt_entrada": dt_entrada,
                "dt_saida": dt_saida,
                "bruto": feat["Bruto (Kg)"],
                "tara": feat["Tara (Kg)"],
                "liquido": feat["Liquido (Ton.)"],
                "n_operacao": feat["N.Operação"]
            })

        for placa in etr_por_placa:
            etr_por_placa[placa].sort(key=lambda x: x["dt_entrada"])

        print(f"Placas com pesagens ETR: {len(etr_por_placa)}")

        garagem_por_placa = defaultdict(list)
        for feat in rotas.getFeatures():
            placa = feat["layer"]
            if not placa:
                continue
            if not eh_garagem(feat["Name"]):
                continue
            dt = to_datetime(feat["Data"], feat["hora"])
            if dt is not None:
                garagem_por_placa[str(placa).strip().upper()].append(dt)

        stays_por_placa = {}
        n_stays = 0
        for placa, pts in garagem_por_placa.items():
            stays = clusterizar_paradas_garagem(pts)
            stays_por_placa[placa] = stays
            n_stays += len(stays)

        print(f"Paradas na garagem ≥ 1 h detectadas: {n_stays}")

        intervalos_por_placa = {}
        for placa, pesagens in etr_por_placa.items():
            stays = stays_por_placa.get(placa, [])
            intervalos_por_placa[placa] = montar_intervalos(pesagens, stays)

        fields = rotas.fields()
        fields.append(QgsField("Tipo_Trecho", QVariant.String))
        fields.append(QgsField("Bruto_Kg", QVariant.Double))
        fields.append(QgsField("Tara_Kg", QVariant.Double))
        fields.append(QgsField("Liquido_Ton", QVariant.Double))
        fields.append(QgsField("N_Operacao_ETR", QVariant.String))
        fields.append(QgsField("Janela_Inicio", QVariant.DateTime))
        fields.append(QgsField("Janela_Fim", QVariant.DateTime))

        crs = rotas.crs()
        layer_out = QgsVectorLayer(
            f"MultiPolygon?crs={crs.authid()}",
            "Rotas_com_Peso_ETR_Garagem",
            "memory"
        )
        pr = layer_out.dataProvider()
        pr.addAttributes(fields.toList())
        layer_out.updateFields()

        total = rotas.featureCount()
        processadas = 0
        contagem = defaultdict(int)
        feats_out = []

        for feat in rotas.getFeatures():
            processadas += 1
            if processadas % 50000 == 0:
                print(f"  Processadas {processadas:,} / {total:,}...")

            placa_raw = feat["layer"]
            placa = str(placa_raw).strip().upper() if placa_raw else None
            dt_ponto = to_datetime(feat["Data"], feat["hora"])

            tipo = "SEM_CLASSIFICACAO"
            bruto = tara = liquido = n_op = None
            janela_ini = janela_fim = None

            if placa and placa in intervalos_por_placa and dt_ponto is not None:
                iv = classificar_ponto(dt_ponto, intervalos_por_placa[placa])
                if iv is not None:
                    tipo = iv["tipo"]
                    janela_ini = QDateTime(iv["inicio"])
                    janela_fim = QDateTime(iv["fim"])
                    if iv["pes"] is not None:
                        bruto = iv["pes"]["bruto"]
                        tara = iv["pes"]["tara"]
                        liquido = iv["pes"]["liquido"]
                        n_op = iv["pes"]["n_operacao"]

            contagem[tipo] += 1

            new_feat = QgsFeature(layer_out.fields())
            new_feat.setGeometry(feat.geometry())
            attrs = list(feat.attributes()) + [
                tipo, bruto, tara, liquido, n_op, janela_ini, janela_fim
            ]
            new_feat.setAttributes(attrs)
            feats_out.append(new_feat)

        pr.addFeatures(feats_out)
        layer_out.updateExtents()
        QgsProject.instance().addMapLayer(layer_out)

        print("\n✅ Camada criada: Rotas_com_Peso_ETR_Garagem")
        print(f"   Total de feições: {layer_out.featureCount():,}")
        for k in ("COLETA", "ETR_GARAGEM", "GARAGEM", "SEM_CLASSIFICACAO"):
            print(f"   {k}: {contagem[k]:,}")

        pasta = os.path.dirname(caminho_rotas)
        saida = os.path.join(pasta, "Rotas_com_Peso_ETR_Garagem.geojson")
        options = QgsVectorFileWriter.SaveVectorOptions()
        options.driverName = "GeoJSON"
        options.fileEncoding = "UTF-8"
        err = QgsVectorFileWriter.writeAsVectorFormatV3(
            layer_out, saida, QgsProject.instance().transformContext(), options
        )
        if err[0] == QgsVectorFileWriter.NoError:
            print(f"Arquivo salvo em:\n{saida}")
        else:
            print("Erro ao salvar:", err[1])
