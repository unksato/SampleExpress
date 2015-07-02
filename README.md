# SampleExpress
Express Server Example

## How to deploy to Google App Engine

- Install Google Cloud SDK
- Create Project
- login

```
$ gcloud auth login
```

- set default Project

```
$ gcloud config set project PROJECT-ID
```

- deploy

```
$ gcloud preview app deploy app.yaml
```
