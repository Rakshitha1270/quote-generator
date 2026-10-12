# Quote Generator with History

A Flask web application that fetches random quotes from a public API, lets users favorite quotes, stores favorites in SQLite, displays favorite history, and supports copy-to-clipboard.

## Features
- Random quotes from DummyJSON public API
- Favorite quote storage
- SQLite backend database
- Favorite history
- Copy-to-clipboard
- Delete favorite
- Responsive UI

## Run locally

```bash
pip install -r requirements.txt
python app.py
```

Open:
http://127.0.0.1:5000

## Deployment
This project can be deployed on Render as a Python web service.

Build command:
```bash
pip install -r requirements.txt
```

Start command:
```bash
gunicorn app:app
```
