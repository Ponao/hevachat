const AdminBro = require('admin-bro')
const AdminBroExpress = require('admin-bro-expressjs')
const AdminBroMongoose = require('admin-bro-mongoose')
const bcrypt = require("bcryptjs");

const User = require('../models/User');
const Room = require('../models/Room');
const Friend = require('../models/Friends');
const Dialog = require('../models/Dialog');
const Tariff = require('../models/Tariff');

AdminBro.registerAdapter(AdminBroMongoose)
const adminBro = new AdminBro({
  rootPath: '/admin',
  branding: {
    companyName: 'Hevachat',
    softwareBrothers: false,
  },
  dashboard: {
    component: AdminBro.bundle('../adminbro/stats')
  },
  resources: [
    {
        resource: User,
        options: {
          actions: {
            delete: {
              isVisible: false,
            },
            new: {
              isVisible: false,
            },
            edit: {
              isVisible: true,
            },
          },
            properties: {
                _id: { isVisible: { list: false, filter: false, show: true, edit: false } },
                email: { isVisible: { list: true, filter: true, show: true, edit: true } },
                friends: { isVisible: { list: false, filter: false, show: false, edit: false } },
                password: { isVisible: { list: false, filter: false, show: false, edit: false } },
                avatar: { isVisible: { list: false, filter: false, show: false, edit: false } },
                roomLang: { isVisible: { list: false, filter: false, show: false, edit: false } },
                pushId: { isVisible: { list: false, filter: false, show: false, edit: false } },
                pushToken: { isVisible: { list: false, filter: false, show: false, edit: false } },
                role: { isVisible: { list: true, filter: true, show: true, edit: true }, availableValues: [
                  {
                    value: 'user',
                    label: 'Пользователь'
                  },
                  {
                    value: 'moder',
                    label: 'Модератор'
                  },
                  {
                    value: 'admin',
                    label: 'Администратор'
                  },
                ] },
                lang: { isVisible: { list: true, filter: true, show: true, edit: false }, availableValues: [
                  {
                    value: 'ru',
                    label: 'Русский'
                  },
                  {
                    value: 'en',
                    label: 'Английский'
                  },
                ] },
                createdAt: { isVisible: { list: false, filter: false, show: false, edit: false } },
                onlineAt: { isVisible: { list: false, filter: false, show: false, edit: false } },
                online: { isVisible: { list: true, filter: true, show: true, edit: false } },
                buff: { isVisible: { list: false, filter: false, show: false, edit: false } },
                color: { isVisible: { list: false, filter: false, show: false, edit: false } },
            },
        }
    },
    {
        resource: Friend,
        options: {
          actions: {
            list: {
              isVisible: false,
              isAccesible: false,
            }
          }
        },
        
    },
    {
      resource: Dialog,
      options: {
        actions: {
          list: {
            isVisible: false,
            isAccesible: false,
          }
        }
      }
    },
    // {
    //   resource: Room,
    //   options: {
    //     href: null,
    //     actions: {
    //       delete: {
    //         isVisible: false,
    //       },
    //       new: {
    //         isVisible: false,
    //       },
    //       edit: {
    //         isVisible: false,
    //       },
    //     },
    //     properties: {
    //       lang: { isVisible: { list: true, filter: true, show: true, edit: false }, availableValues: [
    //         {
    //           value: 'rus',
    //           label: 'Русский'
    //         },
    //         {
    //           value: 'eng',
    //           label: 'Английский'
    //         },
    //       ] },
    //       _id: { isVisible: { list: false, filter: false, show: false, edit: false } },
    //       buff: { isVisible: { list: false, filter: false, show: false, edit: false } },
    //       color: { isVisible: { list: false, filter: false, show: false, edit: false } },
    //       dialog: { isVisible: { list: false, filter: false, show: false, edit: false } },
    //       createdAt: { isVisible: { list: false, filter: false, show: false, edit: false } },
    //       // ownerId: { isVisible: { list: false, filter: false, show: false, edit: false } },
    //       users: { isVisible: { list: false, filter: false, show: false, edit: false } },
    //     }
    //   }
    // },
    {
      resource: Tariff,
      options: {
        properties: {
          _id: { isVisible: { list: false, filter: false, show: false, edit: false } },
          active: { isVisible: { list: true, filter: true, show: true, edit: true } },
          buff: { isVisible: { list: false, filter: false, show: false, edit: false } },
          createdAt: { isVisible: { list: false, filter: false, show: false, edit: false } },
        }
      }
    },
  ],
  locale: {
    translations: {
      labels: {
        User: 'Пользователи',
        Room: 'Комнаты',
        Tariff: 'Тарифы',
      },
    }
  },
})

let router = require('express').Router();

module.exports = adminRouter = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
      let user = await User.findOne({email}).select('+password').select('+email').select('+role')
      if(user && user.role === 'admin') {
          let verifiedPassword = await bcrypt.compare(password, user.password);

          if (verifiedPassword) {
              return {email: user.email, password}
          }
      }

      return null
  },
  cookieName: 'adminbro',
  cookiePassword: 'somePassword',
}, router)