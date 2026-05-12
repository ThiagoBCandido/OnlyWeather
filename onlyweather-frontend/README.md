# OnlyWeather Front-end

Front-end Angular do OnlyWeather. Esta aplicação consome a API Java em `onlyweather-api`, exibe o clima atual de uma cidade, previsão dos próximos dias, favoritos, tema claro/escuro e um mapa meteorológico com radar de precipitação.

## Stack

- Angular 17
- TypeScript
- Tailwind CSS
- Leaflet
- RxJS

## Funcionalidades

- Busca de clima por cidade.
- Card com temperatura, sensação térmica, umidade e vento.
- Previsão diária com chance de chuva.
- Ícones de clima diurno e noturno.
- Tema claro e escuro com contraste adaptado.
- Favoritos salvos em `localStorage`.
- Mapa Leaflet centralizado na cidade pesquisada.
- Camada de precipitação/radar via RainViewer.

## Estrutura

```txt
src/
  app/
    core/
      services/
        weather.service.ts
    features/
      weather-map/
      sun-cycle/
    pages/
      home/
  assets/
    icons/
    weather-icons/
  environments/
    environment.ts
    environment.prod.ts
```

## Configuração da API

O serviço de clima usa `environment.apiUrl`.

Arquivo de desenvolvimento:

```txt
src/environments/environment.ts
```

Exemplo para back-end local:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## Como Rodar

Instale as dependências:

```bash
npm install
```

Inicie o servidor Angular:

```bash
npm start
```

A aplicação abre em:

```txt
http://localhost:4200
```

## Build

```bash
npm run build
```

O build é gerado em:

```txt
dist/onlyweather-frontend
```

## Observações de Desenvolvimento

- O back-end precisa estar disponível no endereço configurado em `environment.apiUrl`.
- O mapa usa tiles externos, então precisa de conexão com a internet para carregar mapa e radar.
- Os favoritos e o tema ficam apenas no navegador do usuário.
- O componente `sun-cycle` existe na estrutura, mas ainda deve ser integrado ao contrato principal da tela para ser exibido como feature final.
