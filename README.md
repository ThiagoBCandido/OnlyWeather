# OnlyWeather

**OnlyWeather** é uma aplicação web de clima em tempo real desenvolvida com **Angular** e **Tailwind CSS**.  
O projeto permite consultar dados meteorológicos reais de cidades, visualizar temperatura atual, sensação térmica, umidade, vento, previsão dos próximos dias e favoritar cidades localmente no navegador.

## Preview

> Em breve!

## Estrutura do projeto

```txt
OnlyWeather/
│
├── .gitignore
│
└── onlyweather-frontend/
    │
    ├── .editorconfig
    ├── .gitignore
    ├── .postcssrc.json
    ├── angular.json
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── tailwind.config.js
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.spec.json
    │
    └── src/
        │
        ├── index.html
        ├── main.ts
        ├── styles.css
        ├── favicon.ico
        │
        ├── app/
        │   │
        │   ├── app.component.css
        │   ├── app.component.html
        │   ├── app.component.spec.ts
        │   ├── app.component.ts
        │   ├── app.config.ts
        │   ├── app.routes.ts
        │   │
        │   ├── core/
        │   │   └── services/
        │   │       ├── weather.service.ts
        │   │       └── weather.service.spec.ts
        │   │
        │   └── pages/
        │       └── home/
        │           ├── home.component.css
        │           ├── home.component.html
        │           ├── home.component.spec.ts
        │           └── home.component.ts
        │
        └── assets/
            │
            ├── icons/
            │   ├── moon.svg
            │   ├── search.svg
            │   ├── star.svg
            │   ├── star-filled.svg
            │   └── sun.svg
            │
            └── weather-icons/
                ├── sunny.svg
                ├── partly-cloudy.svg
                ├── cloudy.svg
                ├── rainy.svg
                └── heavy-rain.svg

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