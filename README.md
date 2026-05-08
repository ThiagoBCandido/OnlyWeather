# OnlyWeather

**OnlyWeather** é uma aplicação web de clima em tempo real desenvolvida com **Angular** e **Tailwind CSS**.  
O projeto permite consultar dados meteorológicos reais de cidades, visualizar temperatura atual, sensação térmica, umidade, vento, previsão dos próximos dias e favoritar cidades localmente no navegador.

## Preview

> Em breve: adicionar prints ou GIF da aplicação aqui.

## Funcionalidades

- Busca de clima por cidade
- Dados meteorológicos reais
- Temperatura atual
- Sensação térmica
- Umidade
- Velocidade do vento
- Previsão dos próximos dias
- Ícones SVG dinâmicos conforme o clima
- Tema claro/escuro
- Cores dinâmicas de acordo com o clima
- Sistema de cidades favoritas
- Favoritos salvos no `localStorage`
- Interface responsiva com foco em mobile
- UI inspirada em aplicativos modernos de clima

## Tecnologias utilizadas

- Angular
- TypeScript
- Tailwind CSS
- HTML
- CSS
- Open-Meteo API
- LocalStorage
- Git e GitHub

## API utilizada

O projeto utiliza a **Open-Meteo API** para buscar dados reais de clima e previsão meteorológica.

Fluxo atual da aplicação:

```txt
Usuário pesquisa uma cidade
        ↓
Angular consulta a API de geocoding
        ↓
Angular obtém latitude e longitude
        ↓
Angular consulta a API de previsão do tempo
        ↓
A interface exibe os dados reais