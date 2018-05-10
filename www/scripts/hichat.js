
window.onload = function () {
    //实例并初始化我们的程序
    var zgh = new zghChat();
    zgh.init();
};
var zghChat = function () {
    this.socket = null;
};
zghChat.prototype = {
    init: function () {//此方法初始化程序
        var that = this;
        //建立到服务器的socket连接
        this.socket = io.connect();
        this.socket.on('connect', function () {
            //连接到服务器后，显示昵称输入框
            document.getElementById('info').textContent = '起个名字';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
        this.socket.on('nickExisted', function () {
            document.getElementById('info').textContent = '已经有此名了';
        });
        this.socket.on('loginSuccess', function () {
            document.title =document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';
        });
        this.socket.on('error', function (err) {
            if (document.getElementById('loginWrapper').style.display == 'none') {
                document.getElementById('status').textContent = '!fail to connect :(';
            } else {
                document.getElementById('info').textContent = '!fail to connect :(';
            }
        });
        this.socket.on('system', function (nickName, userCount, type) {
            //判断用户是连接还是离开以显示不同的信息
            var msg = nickName + (type == 'login' ? ' 上线了' : ' 下线了');
            that._displayNewMsg('系统 ', msg, 'red');
            //将在线人数显示到页面顶部
            document.getElementById('status').textContent = userCount + '人在线';
        });
        this.socket.on('newMsg', function (user, msg, color) {
            that._displayNewMsg(user, msg, color);
        });
        this.socket.on('newImg', function (user, img, color) {
            that._displayImage(user, img, color);
        });
        //昵称设置的登录按钮
        document.getElementById('loginBtn').addEventListener('click', function () {
            var nickName = document.getElementById('nicknameInput').value;
            //var nickName = 'x'
            //检查昵称输入框是否为空
            if (nickName.trim().length != 0) {
                that.socket.emit('login', nickName);
            } else {
                document.getElementById('nicknameInput').focus();
            };
        }, false);
        document.getElementById('nicknameInput').addEventListener('keyup', function (e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                };
            };
        }, false);
        document.getElementById('sended').addEventListener('click', function () {
            var send_text1 = document.getElementById('send_text1'),
                msg = send_text1.value,
                color = document.getElementById('colorStyle').value;
            send_text1.value = '';
            send_text1.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('我自己', msg, color);
                return;
            };
        }, false);
        document.getElementById('send_text1').addEventListener('keyup', function (e) {
            var send_text1 = document.getElementById('send_text1'),
                msg = send_text1.value,
                color = document.getElementById('colorStyle').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                send_text1.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('我自己', msg, color);
            };
        }, false);
        document.getElementById('clearBtn').addEventListener('click', function () {
            document.getElementById('historyMsg').innerHTML = '';
        }, false);
        document.getElementById('sendImage').addEventListener('change', function () {
            if (this.files.length != 0) {
                //获取文件并用FileReader进行读取为base64
                var file = this.files[0],
                    reader = new FileReader(),
                    color = document.getElementById('colorStyle').value;
                if (!reader) {
                    that._displayNewMsg('系统', '你的浏览器版本暂不支持fileReader', 'red');
                    this.value = '';
                    return;
                };
                reader.onload = function (e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result, color);
                    that._displayImage('me', e.target.result, color);
                };
                reader.readAsDataURL(file);
            };
        }, false);
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function (e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function (e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });
        document.getElementById('emojiWrapper').addEventListener('click', function (e) {
            //获取被点击的表情
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var send_text1 = document.getElementById('send_text1');
                send_text1.focus();
                send_text1.value = send_text1.value + '[emoji:' + target.title + ']';
            };
        }, false);
    },
    _initialEmoji: function () {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    },


    _displayNewMsg: function (user, msg, color) {
        msg = this._showEmoji(msg); //文本框的值
        if (user == '我自己') {
            var div1 = document.createElement('div');
            var div2 = document.createElement("div");
            var img2 = document.createElement("img");
            div1.className = "high";   //给div添加类名为high
            div1.id = "highs";
            div2.className = "cry";
            img2.id = "image1";
            img2.src = "images/toux.jpg";
            var len = msg.length;          //定义len收集文本框字体的长度
            div1.style.backgroundColor = "rgb(66,148,214)";
            var shopping1 = len * 15 + len * 2;
            var laughing1 = 550 - (len * 15 + len * 2);
            div1.style.Width = shopping1 / 75 + "rem";
            div1.style.marginLeft = laughing1 / 75 + "rem"
            div1.innerHTML = msg;
            var container = document.getElementById('historyMsg'); //最外层容器
            container.appendChild(div1);
            div1.appendChild(div2);
            div1.appendChild(img2);
            container.scrollTop = container.scrollHeight;
        } else {
            var div3 = document.createElement("div");
            var div4 = document.createElement("div");
            var img3 = document.createElement("img");
            div3.className = "low";   //给div添加类名为high
            div4.className = "laugh";
            img3.id = "image2";
            img3.src = "images/phone-img/10.jpg";
            var len = msg.length;          //定义len收集文本框字体的长度
            div3.style.backgroundColor = "rgb(79,129,86)";
            var shopping2 = len * 2 + len * 15;
            var laughing2 = 550 - (len * 15 + len * 2);
            div3.style.Width = shopping2 / 75 + "rem";
            div3.style.marginRight = laughing2 / 75 + "rem";
            div3.innerHTML = msg;
            var container = document.getElementById('historyMsg'); //最外层容器         
            container.appendChild(div3);
            div3.appendChild(div4);
            div3.appendChild(img3);
        }

        ////-------------------------------------------------------------

    },

    _displayImage: function (user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _showEmoji: function (msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
            };
        };
        return result;
    }
};
