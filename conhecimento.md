# 🧠 Diário de Bordo: Processo de Análise e Onboarding - Projeto Raven

Este documento detalha o passo a passo técnico e investigativo utilizado pela IA para entender, organizar e documentar o projeto Raven.

## 1. Fase de Reconhecimento (Exploração de Arquivos)
O primeiro passo foi mapear a estrutura do repositório para identificar a tecnologia utilizada e o estado atual do projeto.

*   **Comandos de Listagem:** Identificação de que se tratava de um projeto Flutter/Dart devido aos arquivos `pubspec.yaml` e à pasta `lib/`.
*   **Leitura de Configurações:** Análise do `pubspec.yaml` para identificar dependências (Firebase, Material 3) e o nome interno do projeto (`whatsapp2`).

## 2. Engenharia Reversa do Protótipo
Como o projeto não tinha uma documentação clara, foi necessário ler o código-fonte principal (`src/lib/main.dart`) para entender o comportamento do aplicativo.

*   **Identificação da Lógica de Segurança:** Ao ler o estado da tela de bloqueio (`_LockScreenState`), identifiquei os PINs de demonstração:
    *   `2580`: Modo Real.
    *   `0000`: Modo Decoy (isca).
    *   `9999`: Modo Emergência.
*   **Mapeamento de UI:** Análise de como o app alterna entre `_realConversations` e `_decoyConversations` usando a variável global de estado `decoyMode`.

## 3. Investigação de Documentos "Ocultos"
O arquivo `Raven.docx` foi identificado como uma possível fonte de informação, mas por ser um arquivo binário, exigiu técnicas de extração de texto via terminal.

*   **Extração de Texto do DOCX:**
    ```bash
    unzip -p Raven.docx word/document.xml | sed -e 's/<\/w:p>/ \n/g' -e 's/<[^>]*>//g'
    ```
    *   *O que isso faz:* Um arquivo `.docx` é na verdade um conjunto de arquivos XML compactados. O comando descompacta o conteúdo (`unzip -p`), localiza o texto principal (`word/document.xml`) e remove as tags XML (`sed`) para deixar apenas o texto legível.
*   **Descoberta do Link do Canva:** A extração revelou um link para uma apresentação visual, que foi integrado à documentação final.

## 4. Síntese e Documentação
Com o conhecimento técnico (código) e o conhecimento de negócio (Canva/Docx), foi criado o novo `README.md`.

*   **Critério:** Substituir o texto padrão do Flutter por uma explicação que venda o valor do projeto (Privacidade sob pressão) e ensine o novo desenvolvedor a testar as funcionalidades core imediatamente.

## 5. Fluxo de Git (Versionamento)
Para finalizar a tarefa, as mudanças foram integradas ao histórico do projeto seguindo boas práticas de commit.

*   **Status e Diff:** Verificação manual das linhas alteradas para garantir que nenhum código funcional foi deletado acidentalmente.
*   **Commit Semântico:** Uso do prefixo `docs:` para indicar que as alterações foram apenas na documentação.
*   **Push:** Sincronização com o repositório remoto.

---
**Dica de Leitura:** Para entender o código, comece sempre pelo `src/lib/main.dart`. É lá que a "mágica" da troca de interfaces acontece através do controle de estado do Flutter.

## 6. Extração e Reorganização (Maio de 2026)
Nesta fase, recebemos novos arquivos compactados que continham a estrutura atualizada do projeto. Os seguintes comandos foram executados para organizar o ambiente:

*   **Extração Inicial:**
    ```bash
    unzip drive-download-20260519T112419Z-3-001.zip -d .
    ```
    *   *O que isso faz:* Extrai o conteúdo do primeiro arquivo zip para a raiz, revelando arquivos como `main.dart`, `splash_screen.dart` e um segundo zip chamado `Raven.zip`.

*   **Extração do Projeto para `src`:**
    ```bash
    mkdir -p src && unzip Raven.zip -d src
    ```
    *   *O que isso faz:* Cria a pasta `src` (se não existir) e extrai o conteúdo de `Raven.zip` dentro dela.

*   **Reestruturação e Limpeza:**
    ```bash
    mv src/Raven/* src/ && mv src/Raven/.* src/ 2>/dev/null; rmdir src/Raven && mv main.dart src/lib/main.dart && mv splash_screen.dart src/lib/splash_screen.dart && rm Raven.zip drive-download-20260519T112419Z-3-001.zip
    ```
    *   *O que isso faz:* 
        1. Move todos os arquivos (incluindo ocultos) de `src/Raven/` para `src/`.
        2. Remove a pasta vazia `src/Raven/`.
        3. Substitui os arquivos `main.dart` e `splash_screen.dart` dentro de `src/lib/` pelas versões mais recentes que estavam na raiz.
        4. Remove os arquivos `.zip` originais para economizar espaço e manter o ambiente limpo.
