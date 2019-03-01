let git, news;
let env = $app.env;
let app = require("scripts/app.js");

let file = app.user();

let wait = () => addLottie("MainView", "loading", "Please Wait...");

$app.keyboardToolbarEnabled = true;
$app.autoKeyboardEnabled = true;

const Login = {
  type: "blur",
  props: {
    id: "Login",
    style: 2,
    alpha: file == undefined ? 1 : 0
  },
  views: [{
    type: "view",
    props: {
      radius: 20,
      bgcolor: $color("#f5f5f5")
    },
    layout: function (make, view) {
      make.height.equalTo(300);
      make.left.right.inset(20);
      make.center.equalTo(view.super);
    },
    views: [
      {
        type: "image",
        props: {
          bgcolor: $color("clear"),
          icon: $icon("177", $color("black"), $size(35, 35))
        },
        layout: (make, view) => {
          make.top.inset(20);
          make.centerX.equalTo(view.super);
          make.size.equalTo($size(50, 50));
        }
      },
      {
        type: "input",
        props: {
          id: "user",
          type: $kbType.default,
          align: $align.center,
          placeholder: file
            ? file.user
              ? file.user
              : "Please input User"
            : "Please input User"
        },
        layout: function (make, view) {
          //make.top.inset(20)
          make.height.equalTo(40);
          make.left.right.inset(20);
          make.top.equalTo(view.prev.bottom).offset(40);
        },
        events: {
          returned: sender => {
            sender.blur();
          }
        }
      },
      {
        type: "input",
        props: {
          secure: 1,
          id: "token",
          type: $kbType.default,
          align: $align.center,
          placeholder: file
            ? file.token
              ? "**************"
              : "Please input Token"
            : "Please input Token"
        },
        layout: function (make, view) {
          make.height.equalTo(40);
          make.left.right.inset(20);
          make.top.equalTo(view.prev.bottom).offset(20);
        },
        events: {
          returned: sender => {
            sender.blur();
          }
        }
      },
      {
        type: "button",
        props: {
          title: "验证",
          bgcolor: $color("black")
        },
        layout: (make, view) => {
          make.height.equalTo(40);
          make.left.right.inset(30);
          make.centerX.equalTo(view.super);
          make.top.equalTo(view.prev.bottom).offset(20);
        },
        events: {
          tapped: async sender => {
            if ($("user").text && $("token").text) {
              app.user($("user").text, $("token").text);
              $ui.toast("message");
              let flag = await init();
            } else if (file && !$("user").text && !$("token").text)
              animationOfLogin(0);
          }
        }
      }
    ]
  }],
  layout: $layout.fill
};

const repos = {
  type: "button",
  props: {
    title: file ? file.repos ? file.repos : "Choose Repo" : "Choose Repo",
    align: $align.center,
    bgcolor: $color("black")
  },
  layout: function (make, view) {
    make.height.equalTo(30);
    make.left.right.inset(10);
    make.centerX.equalTo(view.super);
    make.top.equalTo(view.prev.bottom).offset(20);
  },
  events: {
    tapped: async sender => {
      sender.userInteractionEnabled = false;
      wait();
      let res = await git.reposCheck();
      lottieStop();
      let pick = await $pick.data({ props: { items: [res] } });
      sender.userInteractionEnabled = true;
      if (pick[0]) {
        git.folder(pick[0]);
        file.repos = pick[0];
        sender.title = pick[0];
        git.log(`Choose Repo -> ${pick[0]}`);
        app.user(file.user, file.token, pick[0]);
      }
    }
  }
};

const logs = [{
  title: "logs",
  rows: [{
    type: "view",
    views: [{
      type: "list",
      props: {
        id: "logs",
        rowHeight: 20,
        bgcolor: $color("#F5F5F5"),
        separatorHidden: false,
        template: {
          props: {
            font: $font(12),
            bgcolor: $color("clear")
          }
        }
      },
      events: {
        didSelect: (sender, indexPath, data) => {
          animationOflistBlur(1);
          $("text").text = data.replace(": ", "\n\n");
        }
      },
      layout: (make, view) => {
        viewsAddShadows(view);
        make.edges.insets($insets(10, 20, 0, 20))
      }
    }, {
      type: "blur",
      props: {
        id: "listBlur",
        alpha: 0,
        style: 1
      },
      views: [{
        type: "text",
        props: {
          editable: 0,
          selectable: 0,
          align: $align.center,
          insets: $insets(20, 5, 20, 5)
        },
        layout: $layout.fill
      }],
      layout: $layout.fill,
      events: {
        tapped: async sender => {
          animationOflistBlur(0);
        }
      }
    }],
    layout: $layout.fill
  }]
}];

const top = {
  type: "view",
  props: {
    id: "Title"
  },
  layout: (make, view) => {
    make.height.equalTo(50);
    make.left.right.inset(10);
    make.top.inset($device.isIphoneX ? 40 : 10);
  },
  views: [
    {
      type: "label",
      props: {
        text: "GitHub",
        align: $align.left,
        font: $font("bold", 35)
      },
      layout: (make, view) => {
        make.width.equalTo(120);
        make.top.left.inset(0);
        make.centerY.equalTo(view.super);
      }
    },
    {
      type: "button",
      props: {
        id: "icon",
        bgcolor: $color("clear"),
        userInteractionEnabled: false,
        icon: $icon("177", $color("black"), $size(35, 35))
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.left.equalTo(view.prev.right);
      },
      events: {
        tapped: async (sender) => {
          findNewFolder(sender);
        }
      }
    }, {
      type: "view",
      props: {
        alpha: 0,
        circular: 1,
        id: "newReposTip",
        bgcolor: $color("red"),
      },
      layout: (make, view) => {
        make.size.equalTo($size(6, 6));
        make.top.equalTo(view.prev.top);
        make.left.equalTo(view.prev.right);
      }
    },
    {
      type: "button",
      props: {
        bgcolor: $color("clear"),
        icon: $icon("225", $color("black"), $size(25, 25)) //关闭
      },
      layout: (make, view) => {
        make.right.inset(0);
        make.centerY.equalTo(view.super);
      },
      events: {
        tapped: () => {
          $app.close();
        }
      }
    },
    {
      type: "button",
      props: {
        bgcolor: $color("clear"),
        icon: $icon("165", $color("blac"), $size(30, 30)) //下载
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.right.equalTo(view.prev.left).offset(-10);
      },
      events: {
        tapped: async sender => {
          if (file.repos) {
            wait();
            sender.userInteractionEnabled = false;
            await git.syncToCloud(file.repos);
            sender.userInteractionEnabled = true;
            lottieStop();
          } else git.log("Please Choose Repos..");
        }
      }
    },
    {
      type: "button",
      props: {
        bgcolor: $color("clear"),
        icon: $icon("166", $color("black"), $size(30, 30)) //上传
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.right.equalTo(view.prev.left).offset(-10);
      },
      events: {
        tapped: async sender => {
          if (file.repos) {
            sender.userInteractionEnabled = false;
            await git.syncToPath(file.repos);
            sender.userInteractionEnabled = true;
          } else git.log("Please Choose Repos..");
        }
      }
    },
    {
      type: "button",
      props: {
        bgcolor: $color("clear"),
        icon: $icon("109", $color("black"), $size(25, 25)) //登陆
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.right.equalTo(view.prev.left).offset(-10);
      },
      events: {
        tapped: async sender => animationOfLogin(1)
      }
    }
  ]
};

const LG = {
  type: "list",
  props: {
    id: "LG",
    data: logs,
    scrollEnabled: 0,
    bgcolor: $color("clear"),
    separatorHidden: true
  },
  layout: (make, view) => {
    make.left.right.inset(0);
    make.height.equalTo(250);
    make.bottom.inset($device.isIphoneX ? 40 : 10);
  },
  events: {
    rowHeight: (sender, indexPath) => {
      if (indexPath.section == 0) {
        return 200;
      }
    }
  }
};




if (env == $env.app) {
  $ui.render({
    props: {
      id: "MainView",
      statusBarStyle: 0,
      navBarHidden: true
    },
    views: [top, repos, LG, Login]
  });
  init();
}

function viewsAddShadows(view) { //在layout中使用即可 给Views添加阴影
  var layer = view.runtimeValue().invoke("layer");
  layer.invoke("setShadowRadius", 10);
  layer.invoke("setCornerRadius", 10);
  layer.invoke("setShadowOpacity", 0.3);
  layer.invoke("setShadowOffset", $size(3, 3));
  layer.invoke("setShadowColor", $color("gray").runtimeValue().invoke("CGColor"));
}

function animationOfLogin(alpha) {
  $ui.animate({
    duration: 0.4,
    animation: function () {
      $("Login").alpha = alpha;
    },
    completion: function () { }
  });
}

function animationOfLottie(alpha) {
  $ui.animate({
    duration: 0.4,
    animation: function () {
      $("Lottie").alpha = alpha;
    },
    completion: function () {
      if (!alpha) $("Lottie").remove();
    }
  });
}

function animationOflistBlur(alpha) {
  $ui.animate({
    duration: 0.4,
    animation: function () {
      $("listBlur").alpha = alpha;
    },
    completion: function () { }
  });
}

function animationOfFolderTips(alpha, handler) {
  $ui.animate({
    duration: 1,
    animation: function () {
      $("newReposTip").alpha = alpha;
    },
    completion: handler
  });
}

function lottie(name, label, style) {
  return {
    type: "blur",
    props: {
      alpha: 0,
      style: style ? style : 1,
      id: "Lottie"
    },
    views: [
      {
        type: "lottie",
        props: {
          loop: 1,
          src: `assets/${name}.json`
        },
        layout: (make, view) => {
          make.size.equalTo($size(200, 200));
          make.center.equalTo(view.super);
        }
      },
      {
        type: "label",
        props: {
          text: label,
          align: $align.center
        },
        layout: function (make, view) {
          make.centerX.equalTo(view.super);
          make.top.equalTo(view.prev.bottom).offset(20);
        }
      }
    ],
    layout: (make, view) => { 
      make.top.inset(0);
      make.left.right.inset(0);
      make.bottom.equalTo($("LG").top)
    }
  };
}

function addLottie(ui, name, label, once) {
  $(ui).add(lottie(name, label));
  animationOfLottie(1);
  if (once) $("lottie").loop = 0;

  $("lottie").play({
    handler: finished => {
      animationOfLottie(0);
    }
  });
}

function lottieStop() {
  $("lottie").stop();
}

function folderTipsFlsh() {
  $("icon").userInteractionEnabled = true;
  animationOfFolderTips(1, () => {
    animationOfFolderTips(0, () => {
      animationOfFolderTips(1, () => {
        animationOfFolderTips(0, () => {
          animationOfFolderTips(1);
        });
      });
    });
  });
}

function findNewFolder(sender) {
  $ui.action({
    title: "News",
    message: "found a new repos option",
    actions: [{
      title: "create repos",
      disabled: false, // Optional
      handler: () => {
        animationOfFolderTips(0);
        sender.userInteractionEnabled = false;
        $delay(3, () => animationOfFolderTips(0));
        news.map(async v => {
          await git.creatRepos(v);
          await git.syncToPath(v);
        })
      }
    },
    {
      title: "ignore option",
      handler: () => {
        animationOfFolderTips(0);
        sender.userInteractionEnabled = false;
        $delay(3, () => animationOfFolderTips(0));
      }
    }
    ]
  })
}

async function init() {
  git = new app.git();
  git.log();

  $thread.background({
    delay: 0.3,
    handler: async () => {
      git.CheckFolder();
    }
  });

  $("logs").data = JSON.parse($file.read("/log").string);
  let flag = await git.tokenCheck(wait);
  animationOfLogin(flag ? 0 : 1);
  lottieStop();
  news = await git.folderCheck();
  if (news.length) folderTipsFlsh();

  return flag;
}