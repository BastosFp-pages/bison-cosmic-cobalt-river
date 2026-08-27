**Formulação de site/WebGIS/dashboard**



* **Visual**

  * O título pode ser "Central de informações da coleta de lixo"
  * No canto superior esquerdo pode ter o logotipo da Prefeitura de Duque de Caxias e o escrito "Prefeitura de Duque de Caxias"





* **Camadas envolvidas:**

  * Rotas validadas - Linhas - Rep
  * Rotas Associadas de todos os dias (camadas da pasta "C:\\Users\\USERR\\Downloads\\Gustavo\\Veiculos\\Novo modelo\\Rotas associadas - Camadas - Expl\\Camadas")
  * Mapa-base (OpenStreetMap ou Google Maps)
  * Estatísticas por trecho (camada de estatísticas gerais e camada de estatísticas de faixas horárias)





* A ideia é integrar as informações de coleta de lixo no lote I, incluindo:

  * Informação de atendimento no dia/turno
  * *Hit rate*
  * Estatísticas por trecho (placas modais, faixas horárias modais, média e outras métrica de velocidade etc.)
* Nesse ambiente HTML, inicialmente haverá um caixa de busca para botar o nome do logradouro.

  * Fazendo a pesquisa, retornará com uma listinha com as ruas e o bairro. Às vezes pode acontecer de existirem ruas com o mesmo nome em bairros diferentes. Então o visitante escolhe a rua clicando em cima do nome na listinha.
  * Ao retornar o resultado, será exibido a rua em formato de linha em destaque, em um mapa de base no fundo (como OpenStreetMap ou Google Maps). Então será solicitado que a pessoa selecione um trecho.

    * Então o trecho será exibido com todas as rotas que a incluem (dias da semana e turnos), *hit rate* e as estatísticas.

      * Os nomes das rotas (ex.: ROTA 120 (Manhã) - São Bento) devem ser hiperlinks, e ao clicar, o trajeto completo daquela rota é aberto no mapa, juntamente com o nome da rota, bairro, dias da semana e turno.
    * Selecionado o trecho também deve haver a opção "Ver dados de atendimento por dia". Nessa opção, haverá uma caixinha de seleção de dia, e escolhendo o dia, puxa as informações de atendimento das Rotas Associadas. Obs.: o dia, para o nosso caso, começa às 6h da manhã e termina às 5h59 do dia seguinte. Ou seja, 4h57 do dia 17/06 ainda é considerado 16/06, por exemplo.
  * **Estatísticas**

    * Fazer uma seção em que o foco sejam as estatísticas. Acessado clicando em um hiperlink no final do site, escrito "Veja mais sobre Estatísticas". Clicando, as opções são:

      * Faixas horárias:

        * Clicando nessa opção, a pessoa vai poder escolher a faixa horária desejada (ex.: 6h-7h, 7h-8h etc.)

          * Selecionando a faixa horária desejada, o mapa irá exibir todos os trechos em que aquela faixa horária é a faixa modal. E ao clicar em cada um dos trechos, aparecerão as demais estatísticas de faixas horárias.
          * Em qualquer horário selecionado, é exibido "Faixa horária modal nos seguintes trechos"
      * Veículos:

        * Clicando nessa opção, a pessoa vai poder escolher a placa de veículo desejada (ex.: TUS0I00)

          * Selecionando o veículo desejado, o mapa irá exibir todos os trechos em que aquela placa indica o veículo compactador modal (mais frequente). E ao clicar em cada um dos trechos, aparecerão as demais estatísticas de placas.
          * Em qualquer horário selecionado, é exibido "Veículo compactador mais frequente nos seguintes trechos"

**Atualização:**

* Site construído, porém com pequenos problemas de informação. As ruas não validadas estão sem o *hit rate*. Nesse caso o problema está no arquivo fonte. Vou consertar e fazer a reposição no Build.
* 66,7% está sendo informado como baixo *hit rate*. Informar para o Build que é o percentual suficiente para a validação.







Crie um código de Terminal Python que transforme os blocos de dias ("C:\\Users\\USERR\\Downloads\\Gustavo\\Veiculos\\Novo modelo\\Rotas\_Validadas\_Final\\Atribuidas"), que estão em buffers, em linhas, usando a camada de logradouros anexada como base de geometria, vinculando pelo id\_trecho. Mantenha todos os campos e valores de atributos dos buffers de blocos de dias, não acrescente nenhum novo. As camadas resultantes devem ser postas em uma nova pasta. 

