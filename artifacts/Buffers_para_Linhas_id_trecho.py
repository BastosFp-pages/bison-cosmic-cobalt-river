# -*- coding: utf-8 -*-
"""
Buffers de blocos de dias  →  linhas de logradouro
Duque de Caxias / coleta Estevão  —  QGIS 3.44  (Terminal Python)

O que faz
---------
1. Lê a camada de logradouros (linhas, quebradas por trecho) e monta um
   dicionário id_trecho → geometria de linha.
2. Percorre todos os arquivos vetoriais da pasta de buffers (blocos de
   dias já atribuídos) e, para cada feição, substitui o polígono pela
   linha correspondente, vinculando por id_trecho.
3. Copia TODOS os campos e valores dos buffers. Nenhum campo novo.
   Feições sem correspondência saem com geometria nula e entram no
   relatório CSV.
4. Grava as camadas-linha em uma pasta nova (irmã da de origem, sufixo
   _Linhas), no mesmo formato de cada arquivo de entrada.

Uso: cole o script no Terminal Python do QGIS 3.44 e execute.
Caminhos-padrão abaixo apontam para a máquina do setor; os diálogos
permitem trocar na hora.
"""

from qgis.core import (
    QgsVectorLayer,
    QgsProject,
    QgsFeature,
    QgsGeometry,
    QgsVectorFileWriter,
    QgsCoordinateTransform,
    QgsWkbTypes,
    QgsFields,
)
from qgis.PyQt.QtWidgets import QFileDialog
import os
import csv


# ---------------------------------------------------------------------------
# Parâmetros (edite se quiser pular os diálogos)
# ---------------------------------------------------------------------------
PASTA_BUFFERS_PADRAO = (
    r"C:\Users\USERR\Downloads\Gustavo\Veiculos"
    r"\Novo modelo\Rotas_Validadas_Final\Atribuidas"
)
CAMPO_CHAVE = "id_trecho"

# Extensões aceitas na pasta de buffers
EXTENSOES = {".gpkg", ".geojson", ".json", ".shp", ".gml", ".kml", ".gpkg"}

# Mapa extensão → driver OGR de saída (espelha o formato de entrada)
DRIVER_POR_EXT = {
    ".gpkg": "GPKG",
    ".geojson": "GeoJSON",
    ".json": "GeoJSON",
    ".shp": "ESRI Shapefile",
    ".gml": "GML",
    ".kml": "KML",
}


def normalizar_id(val):
    """Converte id_trecho para int quando for inteiro (1.0 → 1)."""
    if val is None or val == "":
        return None
    try:
        f = float(val)
        if f == int(f):
            return int(f)
        return f
    except (TypeError, ValueError):
        s = str(val).strip()
        return s if s else None


def achar_campo_chave(layer, nome_preferido=CAMPO_CHAVE):
    """Localiza o campo id_trecho com tolerância a maiúsculas/underscores."""
    nomes = [f.name() for f in layer.fields()]
    if nome_preferido in nomes:
        return nome_preferido
    alvo = nome_preferido.lower().replace(" ", "_")
    for n in nomes:
        if n.lower().replace(" ", "_") == alvo:
            return n
    return None


def listar_vetores(pasta):
    """Lista arquivos vetoriais na pasta (não desce em subpastas)."""
    arquivos = []
    if not os.path.isdir(pasta):
        return arquivos
    for nome in sorted(os.listdir(pasta)):
        caminho = os.path.join(pasta, nome)
        if not os.path.isfile(caminho):
            continue
        ext = os.path.splitext(nome)[1].lower()
        if ext in EXTENSOES:
            arquivos.append(caminho)
    return arquivos


def camadas_do_arquivo(caminho):
    """
    Retorna lista de (uri, nome_camada) para o arquivo.
    GPKG/GML podem ter várias camadas; os demais, uma.
    """
    ext = os.path.splitext(caminho)[1].lower()
    base = os.path.splitext(os.path.basename(caminho))[0]
    if ext == ".gpkg":
        probe = QgsVectorLayer(caminho, base, "ogr")
        sub = probe.dataProvider().subLayers()
        if not sub:
            return [(caminho, base)]
        saida = []
        for item in sub:
            # formato: layerId!!::!!name!!::!!type!!::!!...
            partes = item.split("!!::!!")
            nome_sub = partes[1] if len(partes) > 1 else base
            uri = f"{caminho}|layername={nome_sub}"
            saida.append((uri, nome_sub))
        return saida
    return [(caminho, base)]


def wkb_linha_do_logradouro(layer_log):
    """Define o WKB da camada de saída a partir da geometria dos logradouros."""
    wkb = layer_log.wkbType()
    if QgsWkbTypes.geometryType(wkb) != QgsWkbTypes.LineGeometry:
        # fallback seguro
        return QgsWkbTypes.MultiLineString
    # normaliza para Multi* para caber qualquer trecho
    if QgsWkbTypes.isMultiType(wkb):
        return wkb
    return QgsWkbTypes.multiType(wkb)


def uri_memoria(wkb, crs):
    nome_tipo = QgsWkbTypes.displayString(wkb)
    return f"{nome_tipo}?crs={crs.authid()}"


def clonar_campos(layer_src):
    """Cópia fiel dos QgsField da origem — nenhum campo extra."""
    fields = QgsFields()
    for campo in layer_src.fields():
        fields.append(campo)
    return fields


def gravar_camada(layer, caminho_saida, driver):
    options = QgsVectorFileWriter.SaveVectorOptions()
    options.driverName = driver
    options.fileEncoding = "UTF-8"
    options.layerName = os.path.splitext(os.path.basename(caminho_saida))[0]
    # GeoJSON não admite Z/M mistos; o resto segue o WKB da camada
    err = QgsVectorFileWriter.writeAsVectorFormatV3(
        layer,
        caminho_saida,
        QgsProject.instance().transformContext(),
        options,
    )
    return err


# ---------------------------------------------------------------------------
# Diálogos
# ---------------------------------------------------------------------------
caminho_log, _ = QFileDialog.getOpenFileName(
    None,
    "Selecione a camada de LOGRADOUROS (linhas, com id_trecho)",
    "",
    "Vetores (*.geojson *.gpkg *.shp *.gml);;Todos (*.*)",
)

pasta_buffers = QFileDialog.getExistingDirectory(
    None,
    "Selecione a pasta dos BUFFERS (blocos de dias / Atribuidas)",
    PASTA_BUFFERS_PADRAO if os.path.isdir(PASTA_BUFFERS_PADRAO) else "",
)

if not caminho_log or not pasta_buffers:
    print("Operação cancelada: logradouros ou pasta de buffers não selecionados.")
else:
    pasta_saida_padrao = pasta_buffers.rstrip("\\/") + "_Linhas"
    pasta_saida = QFileDialog.getExistingDirectory(
        None,
        "Selecione (ou crie) a PASTA DE SAÍDA das camadas-linha",
        pasta_saida_padrao if os.path.isdir(pasta_saida_padrao)
        else os.path.dirname(pasta_buffers),
    )
    if not pasta_saida:
        pasta_saida = pasta_saida_padrao
    os.makedirs(pasta_saida, exist_ok=True)

    # ------------------------------------------------------------------
    # 1. Índice id_trecho → geometria de linha
    # ------------------------------------------------------------------
    logradouros = QgsVectorLayer(caminho_log, "logradouros", "ogr")
    if not logradouros.isValid():
        print("ERRO: não foi possível abrir a camada de logradouros.")
    else:
        campo_log = achar_campo_chave(logradouros)
        if campo_log is None:
            print(
                f"ERRO: campo '{CAMPO_CHAVE}' não encontrado nos logradouros. "
                f"Campos: {[f.name() for f in logradouros.fields()]}"
            )
        else:
            idx_geom = {}
            n_log = 0
            n_sem_geom = 0
            n_sem_id = 0
            for feat in logradouros.getFeatures():
                n_log += 1
                chave = normalizar_id(feat[campo_log])
                if chave is None:
                    n_sem_id += 1
                    continue
                if chave in idx_geom:
                    continue  # geometria idêntica por trecho (já verificado)
                geom = feat.geometry()
                if geom is None or geom.isEmpty():
                    n_sem_geom += 1
                    continue
                # guarda cópia independente
                idx_geom[chave] = QgsGeometry(geom)

            crs_log = logradouros.crs()
            wkb_saida = wkb_linha_do_logradouro(logradouros)

            print("=" * 64)
            print("LOGRADOUROS")
            print(f"  arquivo : {caminho_log}")
            print(f"  SRC     : {crs_log.authid()}")
            print(f"  feições : {n_log:,}")
            print(f"  trechos indexados (id_trecho únicos com linha): {len(idx_geom):,}")
            print(f"  sem id_trecho : {n_sem_id:,}   sem geometria : {n_sem_geom:,}")
            print("=" * 64)

            arquivos = listar_vetores(pasta_buffers)
            if not arquivos:
                print(f"Nenhum vetor encontrado em:\n  {pasta_buffers}")
            else:
                print(f"BUFFERS: {len(arquivos)} arquivo(s) em {pasta_buffers}\n")

                relatorio = []  # linhas do CSV de auditoria
                resumo_camadas = []

                for caminho_buf in arquivos:
                    ext = os.path.splitext(caminho_buf)[1].lower()
                    driver = DRIVER_POR_EXT.get(ext, "GPKG")

                    for uri, nome_camada in camadas_do_arquivo(caminho_buf):
                        buf = QgsVectorLayer(uri, nome_camada, "ogr")
                        if not buf.isValid():
                            print(f"  ⚠ ignorado (inválido): {nome_camada}")
                            continue

                        campo_buf = achar_campo_chave(buf)
                        if campo_buf is None:
                            print(
                                f"  ⚠ '{nome_camada}': campo {CAMPO_CHAVE} ausente. "
                                f"Campos = {[f.name() for f in buf.fields()]}"
                            )
                            continue

                        fields = clonar_campos(buf)
                        out = QgsVectorLayer(
                            uri_memoria(wkb_saida, crs_log),
                            f"{nome_camada}_linhas",
                            "memory",
                        )
                        pr = out.dataProvider()
                        pr.addAttributes(fields.toList())
                        out.updateFields()

                        # Reprojeção só se o buffer estiver noutro SRC
                        # (a geometria de saída vem dos logradouros; o
                        # transform aqui é defensivo e não é usado, mas
                        # deixamos o CRS de saída sempre igual ao das linhas).
                        n_ok = 0
                        n_sem_match = 0
                        n_id_nulo = 0
                        n_total = 0
                        feats_out = []

                        for feat in buf.getFeatures():
                            n_total += 1
                            chave = normalizar_id(feat[campo_buf])
                            new_feat = QgsFeature(out.fields())
                            # atributos na ordem original, sem acréscimo
                            new_feat.setAttributes(list(feat.attributes()))

                            if chave is None:
                                n_id_nulo += 1
                                new_feat.setGeometry(QgsGeometry())
                                relatorio.append({
                                    "camada": nome_camada,
                                    "id_trecho": "",
                                    "situacao": "id_trecho nulo",
                                })
                            elif chave in idx_geom:
                                new_feat.setGeometry(QgsGeometry(idx_geom[chave]))
                                n_ok += 1
                            else:
                                n_sem_match += 1
                                new_feat.setGeometry(QgsGeometry())
                                relatorio.append({
                                    "camada": nome_camada,
                                    "id_trecho": chave,
                                    "situacao": "sem linha correspondente",
                                })

                            feats_out.append(new_feat)

                        pr.addFeatures(feats_out)
                        out.updateExtents()

                        # Nome de saída: mesmo basename + _linhas
                        base_arquivo = os.path.splitext(
                            os.path.basename(caminho_buf)
                        )[0]
                        if ext == ".gpkg" and nome_camada != base_arquivo:
                            nome_saida = f"{base_arquivo}__{nome_camada}_linhas{ext}"
                        else:
                            nome_saida = f"{base_arquivo}_linhas{ext}"
                        caminho_saida = os.path.join(pasta_saida, nome_saida)

                        err, msg_err, _, _ = gravar_camada(out, caminho_saida, driver)
                        if err == QgsVectorFileWriter.NoError:
                            QgsProject.instance().addMapLayer(out)
                            status_gravacao = "OK"
                        else:
                            status_gravacao = f"ERRO ao gravar: {msg_err}"

                        print(
                            f"  {nome_camada}: {n_total:,} feições | "
                            f"com linha {n_ok:,} | "
                            f"sem match {n_sem_match:,} | "
                            f"id nulo {n_id_nulo:,} | {status_gravacao}"
                        )
                        print(f"      → {caminho_saida}")

                        resumo_camadas.append({
                            "camada": nome_camada,
                            "total": n_total,
                            "com_linha": n_ok,
                            "sem_match": n_sem_match,
                            "id_nulo": n_id_nulo,
                            "arquivo": caminho_saida,
                            "gravacao": status_gravacao,
                        })

                # ----------------------------------------------------------
                # Relatório CSV de auditoria
                # ----------------------------------------------------------
                csv_resumo = os.path.join(pasta_saida, "_resumo_conversao.csv")
                with open(csv_resumo, "w", newline="", encoding="utf-8") as fh:
                    w = csv.DictWriter(
                        fh,
                        fieldnames=[
                            "camada", "total", "com_linha",
                            "sem_match", "id_nulo", "arquivo", "gravacao",
                        ],
                    )
                    w.writeheader()
                    w.writerows(resumo_camadas)

                csv_pendencias = os.path.join(pasta_saida, "_pendencias_id_trecho.csv")
                with open(csv_pendencias, "w", newline="", encoding="utf-8") as fh:
                    w = csv.DictWriter(fh, fieldnames=["camada", "id_trecho", "situacao"])
                    w.writeheader()
                    w.writerows(relatorio)

                n_pend = len(relatorio)
                print("\n" + "=" * 64)
                print("CONVERSÃO CONCLUÍDA")
                print(f"  pasta de saída : {pasta_saida}")
                print(f"  camadas        : {len(resumo_camadas)}")
                print(f"  pendências     : {n_pend:,}  ({csv_pendencias})")
                print(f"  resumo         : {csv_resumo}")
                if n_pend:
                    print(
                        "\n  Há trechos de buffer sem linha correspondente. "
                        "Isso é esperado em 'ruas sem rota' ou em pontes de "
                        "preenchimento cujo id_trecho não está na camada de "
                        "logradouros usada como base. Abra o CSV de pendências "
                        "e, se for o caso, rode de novo com a malha completa "
                        "(incluindo ruas sem rota)."
                    )
                print("=" * 64)
