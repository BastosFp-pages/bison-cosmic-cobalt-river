# -*- coding: utf-8 -*-
"""
Simplifica o join ETR × Rotas (versão com garagem)
Atualização 26-08-2026

Dissolve:
- COLETA          → uma feição por N_Operacao_ETR (união dos trechos da coleta)
- ETR_GARAGEM     → uma feição por placa + janela (sem peso)
- GARAGEM         → uma feição por placa + janela (sem peso)

SEM_CLASSIFICACAO não entra no dissolve (não representa operação nem
deslocamento ETR–garagem).
"""

from qgis.core import (
    QgsVectorLayer, QgsProject, QgsFeature, QgsField,
    QgsGeometry, QgsVectorFileWriter
)
from qgis.PyQt.QtCore import QVariant, QDate, QDateTime
from qgis.PyQt.QtWidgets import QFileDialog
from collections import defaultdict
from datetime import datetime, date
import os


def to_qdate(val):
    if val is None:
        return None
    if isinstance(val, QDate):
        return val
    if isinstance(val, date) and not isinstance(val, datetime):
        return QDate(val.year, val.month, val.day)
    if isinstance(val, datetime):
        return QDate(val.year, val.month, val.day)
    if isinstance(val, QDateTime):
        return val.date()
    if isinstance(val, str):
        for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y"):
            try:
                d = datetime.strptime(val[:10], fmt).date()
                return QDate(d.year, d.month, d.day)
            except ValueError:
                continue
    return None


def to_qdatetime(val):
    if val is None:
        return None
    if isinstance(val, QDateTime):
        return val
    if isinstance(val, datetime):
        return QDateTime(val)
    if isinstance(val, str):
        for fmt in (
            "%Y-%m-%d %H:%M:%S",
            "%Y/%m/%d %H:%M:%S",
            "%Y-%m-%d %H:%M",
            "%Y/%m/%d %H:%M",
            "%d/%m/%Y %H:%M:%S"
        ):
            try:
                return QDateTime(datetime.strptime(val, fmt))
            except ValueError:
                continue
    return None


def chave_grupo(feat):
    tipo = feat["Tipo_Trecho"]
    if tipo == "COLETA":
        n_op = feat["N_Operacao_ETR"]
        if not n_op:
            return None
        return ("COLETA", str(n_op))
    if tipo in ("ETR_GARAGEM", "GARAGEM"):
        placa = feat["layer"] or ""
        ini = feat["Janela_Inicio"]
        fim = feat["Janela_Fim"]
        ini_s = str(ini) if ini else ""
        fim_s = str(fim) if fim else ""
        return (tipo, str(placa).strip().upper(), ini_s, fim_s)
    return None


caminho, _ = QFileDialog.getOpenFileName(
    None,
    "Selecione Rotas_com_Peso_ETR_Garagem.geojson",
    "",
    "GeoJSON (*.geojson)"
)

if not caminho:
    print("Nenhum arquivo selecionado.")
else:
    layer = QgsVectorLayer(caminho, "Rotas_com_Peso_Garagem", "ogr")

    if not layer.isValid():
        print("Erro ao carregar a camada.")
    else:
        print(f"Camada carregada: {layer.featureCount():,} feições")

        grupos = defaultdict(lambda: {
            "tipo": None,
            "geoms": [],
            "Bairro_logradouros": set(),
            "Bairro_rotas": set(),
            "Rota": set(),
            "layer": set(),
            "Data": None,
            "Bruto_Kg": None,
            "Tara_Kg": None,
            "Liquido_Ton": None,
            "N_Operacao_ETR": None,
            "Janela_Inicio": None,
            "Janela_Fim": None
        })

        usadas = 0
        for feat in layer.getFeatures():
            key = chave_grupo(feat)
            if key is None:
                continue
            usadas += 1
            g = grupos[key]
            g["tipo"] = key[0]

            if feat.hasGeometry() and not feat.geometry().isEmpty():
                g["geoms"].append(QgsGeometry(feat.geometry()))

            if feat["Bairro_logradouros"]:
                g["Bairro_logradouros"].add(str(feat["Bairro_logradouros"]))
            if feat["Bairro_rotas"]:
                g["Bairro_rotas"].add(str(feat["Bairro_rotas"]))

            rota_val = feat["Rota"]
            if rota_val:
                if isinstance(rota_val, (list, tuple)):
                    for r in rota_val:
                        if r:
                            g["Rota"].add(str(r))
                else:
                    g["Rota"].add(str(rota_val))

            if feat["layer"]:
                g["layer"].add(str(feat["layer"]))

            if g["Data"] is None:
                g["Data"] = to_qdate(feat["Data"])

            if g["tipo"] == "COLETA":
                if g["N_Operacao_ETR"] is None and feat["N_Operacao_ETR"]:
                    g["N_Operacao_ETR"] = feat["N_Operacao_ETR"]
                if g["Bruto_Kg"] is None and feat["Bruto_Kg"] is not None:
                    g["Bruto_Kg"] = feat["Bruto_Kg"]
                if g["Tara_Kg"] is None and feat["Tara_Kg"] is not None:
                    g["Tara_Kg"] = feat["Tara_Kg"]
                if g["Liquido_Ton"] is None and feat["Liquido_Ton"] is not None:
                    g["Liquido_Ton"] = feat["Liquido_Ton"]

            if g["Janela_Inicio"] is None:
                g["Janela_Inicio"] = to_qdatetime(feat["Janela_Inicio"])
            if g["Janela_Fim"] is None:
                g["Janela_Fim"] = to_qdatetime(feat["Janela_Fim"])

        print(f"Feições usadas no dissolve: {usadas:,}")
        print(f"Grupos: {len(grupos):,}")

        crs = layer.crs()
        out = QgsVectorLayer(
            f"MultiPolygon?crs={crs.authid()}",
            "Rotas_Peso_Simplificado_Garagem",
            "memory"
        )
        pr = out.dataProvider()
        pr.addAttributes([
            QgsField("Tipo_Trecho", QVariant.String),
            QgsField("N_Operacao_ETR", QVariant.String),
            QgsField("layer", QVariant.StringList),
            QgsField("Data", QVariant.Date),
            QgsField("Bairro_logradouros", QVariant.StringList),
            QgsField("Bairro_rotas", QVariant.StringList),
            QgsField("Rota", QVariant.StringList),
            QgsField("Bruto_Kg", QVariant.Double),
            QgsField("Tara_Kg", QVariant.Double),
            QgsField("Liquido_Ton", QVariant.Double),
            QgsField("Janela_Inicio", QVariant.DateTime),
            QgsField("Janela_Fim", QVariant.DateTime),
            QgsField("Qtd_Trechos", QVariant.Int)
        ])
        out.updateFields()

        def to_list(s):
            return sorted(list(s)) if s else []

        feats_out = []
        for g in grupos.values():
            if not g["geoms"]:
                continue
            geom = QgsGeometry.unaryUnion(g["geoms"])
            if geom.isEmpty():
                continue
            feat = QgsFeature(out.fields())
            feat.setGeometry(geom)
            feat.setAttributes([
                g["tipo"],
                g["N_Operacao_ETR"],
                to_list(g["layer"]),
                g["Data"],
                to_list(g["Bairro_logradouros"]),
                to_list(g["Bairro_rotas"]),
                to_list(g["Rota"]),
                g["Bruto_Kg"],
                g["Tara_Kg"],
                g["Liquido_Ton"],
                g["Janela_Inicio"],
                g["Janela_Fim"],
                len(g["geoms"])
            ])
            feats_out.append(feat)

        pr.addFeatures(feats_out)
        out.updateExtents()
        QgsProject.instance().addMapLayer(out)

        print(f"\n✅ Camada simplificada: {out.featureCount():,} feições")

        pasta = os.path.dirname(caminho)
        saida = os.path.join(pasta, "Rotas_Peso_Simplificado_Garagem.geojson")
        options = QgsVectorFileWriter.SaveVectorOptions()
        options.driverName = "GeoJSON"
        options.fileEncoding = "UTF-8"
        err = QgsVectorFileWriter.writeAsVectorFormatV3(
            out, saida, QgsProject.instance().transformContext(), options
        )
        if err[0] == QgsVectorFileWriter.NoError:
            print(f"Arquivo salvo em:\n{saida}")
        else:
            print("Erro ao salvar:", err[1])
