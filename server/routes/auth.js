/**
 * auth.js
 * Author: Roman Shuvalov
 */
'use strict';

const router = require('express').Router();
const { check } = require('express-validator');
const AuthController = require('../controllers/AuthController')

// Sign up a new user
router.post('/register', [
  check('email')
    .isEmail().withMessage('Неверный Email')
    .notEmpty().withMessage('Email не может быть пустым'),
  check('password').isLength({ min: 8 }).withMessage('Пароль должен содержать минимум 8 символов')
], AuthController.register);

// Log in an existing user
router.post('/login', [
  check('email')
    .isEmail().withMessage('Неверный Email')
    .notEmpty().withMessage('Email не может быть пустым'),
  check('password').isLength({ min: 8 }).withMessage('Пароль должен содержать минимум 8 символов')
], AuthController.login);

// forgot an existing user
router.post('/forgot', [
  check('email')
    .isEmail().withMessage('Неверный Email')
    .notEmpty().withMessage('Email не может быть пустым'),  
], AuthController.forgot);
router.post('/reset', [
  check('password')
  .notEmpty().withMessage('Пароль не может быть пустым')
  .isLength({ min: 8 }).withMessage('Пароль должен содержать минимум 8 символов'), 
  check('passwordConfirm')
  .custom((value, { req }) => value === req.body.password).withMessage('Подтверждение должно совпадать с паролем'),  
], AuthController.reset);

module.exports = router;