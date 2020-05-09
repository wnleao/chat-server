## Quick heroku setup

After cloning the project and installing heroku cli.

If you already have a heroku project:

```console
git remote add heroku <heroku_project_git_address>
```

If you don't have one:

```console
heroku create
```

Then,

```console
git push heroku master
```

### References

https://devcenter.heroku.com/articles/deploying-nodejs

https://devcenter.heroku.com/articles/node-websockets#option-2-socket-io

## Important heroku commands

### Running it locally 

```console
heroku local web
```

### How to access heroku logs?

```console
heroku logs --tail
```

### Scaling the app

#### Shutting it down

```console
heroku ps:scale web=0
```

#### Getting it up again

```console
heroku ps:scale web=1
```

### References

https://devcenter.heroku.com/articles/getting-started-with-nodejs?singlepage=true