import pandas as pd
import unicodedata
from tkinter import Tk
from tkinter.filedialog import askopenfilename
import os

# Função para remover acentos de uma string
def remove_acentos(texto):
    return ''.join((c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn'))

# Função principal
def processar_excel():
    # Esconde a janela principal do Tkinter
    Tk().withdraw()

    # Abre a caixa de diálogo para selecionar o arquivo Excel
    caminho_arquivo = askopenfilename(title="Selecione o arquivo Excel", filetypes=[("Excel files", "*.xlsx *.xls")])
    if not caminho_arquivo:
        print("Nenhum arquivo selecionado.")
        return

    # Carrega o arquivo Excel
    try:
        df = pd.read_excel(caminho_arquivo)
    except Exception as e:
        print(f"Erro ao carregar o arquivo Excel: {e}")
        return

    # Remove acentos de todo o conteúdo do DataFrame
    df = df.applymap(lambda x: remove_acentos(str(x)) if isinstance(x, str) else x)

    # Define o novo caminho para salvar o arquivo
    diretorio, nome_arquivo = os.path.split(caminho_arquivo)
    novo_nome_arquivo = "sem_acentos_" + nome_arquivo
    novo_caminho = os.path.join(diretorio, novo_nome_arquivo)

    # Salva o novo arquivo
    try:
        df.to_excel(novo_caminho, index=False)
        print(f"Arquivo salvo com sucesso em: {novo_caminho}")
    except Exception as e:
        print(f"Erro ao salvar o arquivo: {e}")

# Executa a função
processar_excel()
