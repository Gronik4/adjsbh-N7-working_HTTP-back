const http = require('http');
const koaBode = require('koa-body');
const cors = require('koa-cors');
const Koa = require('koa');
const fs = require('fs');
const app = new Koa();

app.use(koaBode({
  urlencoded: true,
  json: true,
  multipart: true,
}));

app.use(cors());

app.use(async (ctx, next) =>{
  const put = ctx.request.body;
  const save1 = fs.readFileSync('save.json');
  const save = JSON.parse(save1);
  const method = ctx.request.method;
  switch (method) {
    case 'GET':
      try {
        ctx.response.body = fs.readFileSync('save.json');
      } catch (err) {console.error(err);}
      break;
    case 'POST':
      if(!put.name || !put.check || !put.creat || !put.discription) {
        ctx.status = 400;
        ctx.error = 'Действие не возможно. Данных для записи не достаточно.';
        break;}
      const timeC = Math.floor(Date.now()/1000);
      put.id = `${timeC}`;
      save.tasks.push(put);
      fs.writeFileSync('save.json', JSON.stringify(save, null, 2));
      ctx.response.body = put;
      break;
    case 'PUT':
      if(!put.id) {
        ctx.status = 400;
        ctx.error = 'Действие не выполнено. Не достаточно данных для данной операции.';
        //ctx.response.body = 'Действие не выполнено.Такой задачи не существует.';
        break;
      }
      const {id, name, discription, check, creat, method} = put;
      const chenge = save.tasks.find((item) => item.id === id);
      const index = save.tasks.findIndex((item) => item.id === id);
      if(index === -1) {
        ctx.status = 400;
        //ctx.response.body = 'Действие не выполнено.Такой задачи не существует.';
        ctx.error = 'Действие не выполнено. Такой задачи не существует.';
        break;
      }
      if(method === 'delete') {
        save.tasks.splice(index, 1);
        fs.writeFileSync('save.json', JSON.stringify(save, null, 2));
        ctx.response.body = fs.readFileSync('save.json');
      break;
      }
      if(name) {chenge.name = name;}
      if(discription) {chenge.discription = discription;}
      if(check) {chenge.check = check;}
      if(creat) {chenge.creat = creat;}
      save.tasks.splice(index, 1, chenge);
      fs.writeFileSync('save.json', JSON.stringify(save, null, 2));
      ctx.response.body = fs.readFileSync('save.json');
      break;
    default: break;
  }
  await next();
});

const port = process.env.PORT || 8080;
http.createServer(app.callback()).listen(port, (err) => {
  if(err) {
    return console.log(`string18 ${err}.`)
  }
  console.log(`Сервер запущен на порту №${port}.`)
})
