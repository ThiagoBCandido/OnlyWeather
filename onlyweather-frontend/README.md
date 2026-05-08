# OnlyWeather

**OnlyWeather** é uma aplicação web full-stack de clima em tempo real, desenvolvida com **Angular**, **Tailwind CSS** e **Java Spring Boot**.

O projeto permite consultar dados meteorológicos reais de cidades, visualizar temperatura atual, sensação térmica, umidade, velocidade do vento, previsão dos próximos dias e salvar cidades favoritas localmente no navegador.

---

## Preview

> Em breve: adicionar imagem ou GIF da aplicação.

---

## Funcionalidades

- Busca de clima por cidade
- Consumo de dados reais de clima
- Temperatura atual
- Sensação térmica
- Umidade
- Velocidade do vento
- Previsão dos próximos dias
- Chance de chuva na previsão diária
- Ícones SVG dinâmicos conforme o clima
- Tema claro e escuro
- Cores dinâmicas de acordo com o clima atual
- Sistema de cidades favoritas
- Favoritos salvos no `localStorage`
- Interface responsiva com foco em mobile
- Back-end próprio com Java Spring Boot
- Integração com API externa de clima

---

## Tecnologias utilizadas

### Front-end

- Angular
- TypeScript
- Tailwind CSS
- HTML
- CSS
- LocalStorage

### Back-end

- Java
- Spring Boot
- Maven
- Spring Web
- Validation
- RestTemplate

### API externa

- Open-Meteo API

### Versionamento

- Git
- GitHub

---

## Arquitetura da aplicação

A versão atual do projeto funciona como uma aplicação full-stack:

```txt
Usuário
   ↓
Angular
   ↓
Spring Boot API
   ↓
Open-Meteo API
```

O Angular não consulta mais diretamente a API externa.  
Agora o front-end chama o back-end Java, e o back-end fica responsável por consultar a Open-Meteo, tratar os dados e devolver uma resposta organizada para a interface.

---

## API utilizada

O projeto utiliza a **Open-Meteo API** para obter dados reais de clima e previsão meteorológica.

A aplicação utiliza dois serviços principais:

- **Geocoding API**: transforma o nome da cidade em latitude e longitude.
- **Forecast API**: retorna clima atual e previsão dos próximos dias.

Fluxo da busca:

```txt
Usuário pesquisa uma cidade
        ↓
Angular envia a cidade para o Spring Boot
        ↓
Spring Boot consulta a API de geocoding
        ↓
Spring Boot obtém latitude e longitude
        ↓
Spring Boot consulta a API de previsão do tempo
        ↓
Spring Boot trata os dados
        ↓
Angular exibe os dados reais na interface
```

---

## Endpoint principal do back-end

```txt
GET /api/weather?city=Ribeirao Preto
```

Exemplo local:

```txt
http://localhost:8080/api/weather?city=Ribeirao%20Preto
```

Exemplo de resposta:

```json
{
  "cityName": "Ribeirão Preto",
  "country": "Brazil",
  "countryCode": "BR",
  "temperature": 31,
  "feelsLike": 29,
  "humidity": 28,
  "windSpeed": 15,
  "condition": "Partly cloudy",
  "weatherType": "partly-cloudy",
  "icon": "assets/weather-icons/partly-cloudy.svg",
  "updatedAt": "2026-05-08T16:00",
  "forecast": [
    {
      "day": "Fri",
      "date": "2026-05-08",
      "minTemperature": 20,
      "maxTemperature": 31,
      "rainChance": 10,
      "condition": "Partly cloudy",
      "weatherType": "partly-cloudy",
      "icon": "assets/weather-icons/partly-cloudy.svg"
    }
  ]
}
```

---

## Estados visuais do clima

A interface muda dinamicamente de acordo com o clima retornado pelo back-end.

Estados utilizados:

- Ensolarado
- Parcialmente nublado
- Nublado
- Chuvoso
- Chuva intensa / tempestade

Cada estado possui:

- Ícone SVG próprio
- Gradiente de fundo próprio
- Card com cor própria
- Variação para modo claro
- Variação para modo escuro

---

## Estrutura do projeto

```txt
OnlyWeather/
│
├── .gitignore
├── README.md
│
├── onlyweather-frontend/
│   │
│   ├── .editorconfig
│   ├── .gitignore
│   ├── .postcssrc.json
│   ├── angular.json
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.spec.json
│   │
│   └── src/
│       │
│       ├── index.html
│       ├── main.ts
│       ├── styles.css
│       ├── favicon.ico
│       │
│       ├── app/
│       │   │
│       │   ├── app.component.css
│       │   ├── app.component.html
│       │   ├── app.component.spec.ts
│       │   ├── app.component.ts
│       │   ├── app.config.ts
│       │   ├── app.routes.ts
│       │   │
│       │   ├── core/
│       │   │   └── services/
│       │   │       ├── weather.service.ts
│       │   │       └── weather.service.spec.ts
│       │   │
│       │   └── pages/
│       │       └── home/
│       │           ├── home.component.css
│       │           ├── home.component.html
│       │           ├── home.component.spec.ts
│       │           └── home.component.ts
│       │
│       └── assets/
│           │
│           ├── icons/
│           │   ├── moon.svg
│           │   ├── search.svg
│           │   ├── star.svg
│           │   ├── star-filled.svg
│           │   └── sun.svg
│           │
│           └── weather-icons/
│               ├── sunny.svg
│               ├── partly-cloudy.svg
│               ├── cloudy.svg
│               ├── rainy.svg
│               └── heavy-rain.svg
│
└── onlyweather-api/
    │
    ├── .gitattributes
    ├── .gitignore
    ├── mvnw
    ├── mvnw.cmd
    ├── pom.xml
    │
    └── src/
        │
        ├── main/
        │   │
        │   ├── java/
        │   │   └── com/
        │   │       └── onlyweather/
        │   │           └── api/
        │   │               │
        │   │               ├── OnlyweatherApiApplication.java
        │   │               │
        │   │               ├── client/
        │   │               │   ├── GeocodingClient.java
        │   │               │   └── OpenMeteoClient.java
        │   │               │
        │   │               ├── config/
        │   │               │   ├── CorsConfig.java
        │   │               │   └── RestTemplateConfig.java
        │   │               │
        │   │               ├── controller/
        │   │               │   └── WeatherController.java
        │   │               │
        │   │               ├── dto/
        │   │               │   ├── CityLocationResponse.java
        │   │               │   ├── ErrorResponse.java
        │   │               │   ├── ForecastDayResponse.java
        │   │               │   ├── GeocodingApiResponse.java
        │   │               │   ├── OpenMeteoApiResponse.java
        │   │               │   └── WeatherResponse.java
        │   │               │
        │   │               ├── exception/
        │   │               │   ├── CityNotFoundException.java
        │   │               │   └── GlobalExceptionHandler.java
        │   │               │
        │   │               └── service/
        │   │                   └── WeatherService.java
        │   │
        │   └── resources/
        │       └── application.properties
        │
        └── test/
            └── java/
                └── com/
                    └── onlyweather/
                        └── api/
                            └── OnlyweatherApiApplicationTests.java
```

---

## Principais arquivos do front-end

### `weather.service.ts`

Responsável por:

- Chamar a API Java Spring Boot
- Enviar a cidade pesquisada como parâmetro
- Receber os dados tratados do back-end
- Retornar as informações para o componente principal

---

### `home.component.ts`

Responsável por:

- Controlar a busca por cidade
- Exibir os dados atuais do clima
- Alternar entre tema claro e escuro
- Atualizar o visual conforme o clima
- Salvar e remover cidades favoritas
- Persistir favoritos usando `localStorage`

---

### `home.component.html`

Responsável pela estrutura visual da tela principal:

- Header
- Botão de tema
- Barra de pesquisa
- Card de clima atual
- Previsão dos próximos dias
- Lista de cidades favoritas

---

## Principais arquivos do back-end

### `WeatherController.java`

Responsável por expor o endpoint:

```txt
GET /api/weather?city=...
```

Ele recebe a cidade enviada pelo Angular e retorna os dados meteorológicos tratados.

---

### `WeatherService.java`

Responsável pela regra principal da aplicação:

- Receber a cidade
- Buscar latitude e longitude
- Buscar clima atual e previsão
- Mapear códigos climáticos
- Definir o tipo visual do clima
- Montar a resposta final para o front-end

---

### `GeocodingClient.java`

Responsável por consultar a API de geocoding da Open-Meteo.

Ele transforma o nome da cidade em:

- Latitude
- Longitude
- País
- Código do país
- Timezone

---

### `OpenMeteoClient.java`

Responsável por consultar a API de previsão do tempo da Open-Meteo.

Ele busca:

- Temperatura atual
- Sensação térmica
- Umidade
- Vento
- Código do clima
- Previsão dos próximos dias

---

### `GlobalExceptionHandler.java`

Responsável por tratar erros da API, como:

- Cidade não encontrada
- Parâmetro inválido
- Erro inesperado na consulta externa

---

### `CorsConfig.java`

Responsável por permitir que o Angular acesse o back-end durante o desenvolvimento local.

---

## Como executar o projeto

Para rodar o projeto completo, é necessário iniciar o back-end e o front-end em terminais separados.

---

### 1. Clone o repositório

```bash
git clone https://github.com/ThiagoBCandido/onlyweather.git
```

```bash
cd onlyweather
```

---

## Executando o back-end

### 1. Acesse a pasta da API

```bash
cd onlyweather-api
```

### 2. Execute o Spring Boot

No Windows:

```bash
.\mvnw spring-boot:run
```

No Linux/macOS:

```bash
./mvnw spring-boot:run
```

A API ficará disponível em:

```txt
http://localhost:8080
```

Teste o endpoint:

```txt
http://localhost:8080/api/weather?city=Ribeirao%20Preto
```

---

## Executando o front-end

Em outro terminal, acesse a pasta do front-end:

```bash
cd onlyweather-frontend
```

Instale as dependências:

```bash
npm install
```

Execute a aplicação:

```bash
npm start
```

A aplicação ficará disponível em:

```txt
http://localhost:4200
```

---

## Build do front-end

Para gerar a versão de produção do Angular:

```bash
npm run build
```

Os arquivos finais serão gerados na pasta:

```txt
dist/
```

---

## Dados salvos localmente

O projeto utiliza `localStorage` para salvar informações no navegador do usuário.

Atualmente são salvos:

- Tema selecionado
- Cidades favoritas

Chaves utilizadas:

```txt
onlyweather-theme
onlyweather-favorite-cities
```

Como não há cadastro ou login, as cidades favoritas ficam salvas apenas no navegador utilizado.

---

## Banco de dados

Este projeto atualmente **não utiliza banco de dados**.

A decisão foi manter os dados locais no navegador porque o app não possui cadastro, login ou contas de usuário.

---

## Status do projeto

O projeto está em desenvolvimento.

### Implementado

- Interface principal
- Consumo de dados reais de clima
- Front-end em Angular
- Back-end em Java Spring Boot
- Endpoint `/api/weather`
- Integração com Open-Meteo API
- Busca por cidade
- Previsão dos próximos dias
- Tema claro e escuro
- Cores dinâmicas por clima
- Ícones SVG
- Favoritos com `localStorage`
- Layout mobile-first
- Tailwind CSS configurado
- Tratamento básico de erros no back-end
- CORS configurado para ambiente local

### Próximas melhorias

- Adicionar cache no back-end
- Melhorar tratamento de erros
- Adicionar loading visual mais refinado
- Melhorar responsividade para desktop
- Adicionar testes no front-end
- Adicionar testes no back-end
- Criar deploy do front-end
- Criar deploy do back-end
- Adicionar imagens reais da aplicação no README

---

## Objetivo do projeto

O objetivo do **OnlyWeather** é praticar o desenvolvimento de uma aplicação moderna full-stack consumindo dados reais de uma API externa, com foco em:

- Desenvolvimento front-end com Angular
- Desenvolvimento back-end com Java Spring Boot
- Consumo de APIs REST
- Organização de serviços
- DTOs
- Tratamento de erros
- Integração front-end e back-end
- Uso de Tailwind CSS
- Interface responsiva
- Persistência local com `localStorage`
- Boas práticas de versionamento com Git

---

## Autor

Desenvolvido por **Thiago Barbosa Candido**.

GitHub: [ThiagoBCandido](https://github.com/ThiagoBCandido)