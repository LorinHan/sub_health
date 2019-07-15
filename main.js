const {app, BrowserWindow} = require('electron');
const exec = require('child_process').exec;
// 解决中文乱码
var iconv = require('iconv-lite');
var encoding = 'cp936';
var binaryEncoding = 'binary';
var path = require('path');


//声明我们的greeting窗体变量
let greetingWin;

const ipc = require('electron').ipcMain

// ====================================================================
// 任何你期望执行的cmd命令，ls都可以
let cmdStr = 'python baiduAItest.py'
// 执行cmd命令的目录，如果使用cd xx && 上面的命令，这种将会无法正常退出子进程
let cmdPath = path.join(__dirname + '/static')
// 子进程名称
let workerProcess
 
 
function runExec(greetingWin) {
  // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
  workerProcess = exec(cmdStr, {cwd: cmdPath, encoding: binaryEncoding})
  // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
 
  // 打印正常的后台可执行程序输出
  workerProcess.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
    // 主线程发送
    greetingWin.webContents.send('audio', iconv.decode(new Buffer(data, binaryEncoding), encoding))
  });
 
  // 打印错误的后台可执行程序输出
  workerProcess.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });
 
  // 退出之后的输出
  workerProcess.on('close', function (code) {
    console.log('out code：' + code);
  })
}
// ===================================================================

//当app完成初始化时，执行窗体的创建。
app.on('ready', createGreetingWindow)

function createGreetingWindow(){
    //构建一个高600，宽800的窗体，可以认为，一个窗体是一个浏览器的tab选项卡。
    greetingWin = new BrowserWindow({
      width: 1366, 
      height: 800,
      // 让require可以使用
      webPreferences: {
        nodeIntegration: true
      }
    })
    //窗体中显示的内容是index.html文件中的内容，将按照google浏览器的渲染方式，渲染显示。
    //__dirname,表示main.js所在的目录路径
    greetingWin.loadURL(__dirname + "/index.html")
    // greetingWin.openDevTools();

    greetingWin.webContents.on('did-finish-load', () => {
        // 主线程发送
        greetingWin.webContents.send('ping', 'whoooooooh!')
        // runExec(greetingWin)
      })
    // 主线程接收
    ipc.on('getMsg', (sys, msg) => {
        console.log(msg)  //接收窗口传来的消息
    })

    //监听窗体关闭事件，当窗体已经关闭时，将win赋值为null，垃圾回收。
    greetingWin.on('closed', () => {
       win = null
       app.quit();
    }) 
}