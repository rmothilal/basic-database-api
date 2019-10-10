# basic-database-api

## Install from remote repo

#### Configure remote Helm repo on your Helm Client
```
1. Add repo 

`helm repo add rmothilal https://rmothilal.github.io/basic-database-api/helm/repo`

2. Keep your local repo up to date

`helm repo up rmothilal`
```
#### Deployment from remote repo
```
1. Deploy chart

- `helm install --debug --namespace={{NAME_SPACE}} --name={{RELEASE_NAME}} --repo=https://rmothilal.github.io/basic-database-api/helm/repo basic-database-api`
```

## Install from local

#### How to install manually from git repo:

```$xslt
run:
helm dep update ./helm/basic-database-api/

next:
helm install --namespace {{NAME_SPACE}} ./helm/basic-database-api/
```

## How to use REST endpoints

```$xslt
kubectl -n {{NAME_SPACE}} port-forward service/{{RELEASE_NAME}}-basic-database-api 8080:80

curl -X GET http://localhost:8080/users 

curl -X POST http://localhost:8080/add/{{userName}}
```

## Publish helm repo
```$xslt
run:
helm package -u -d ./helm/repo ./helm/basic-database-api/

next:
helm repo index ./helm/repo/ --url https://rmothilal.github.io/basic-database-api/helm/repo
```
