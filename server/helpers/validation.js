import _ from 'lodash';
import moment from 'moment';
import validator from 'validator';
import {Types} from 'mongoose';
const isValidObjectId = Types.ObjectId.isValid;

import Card from '../api/card/card.model';
import Company from '../api/company/company.model';

const models = {
  Card,
  Company
};

/**
 * Check structured validation in middleware
 * @param validationRules Validation rules for endpoints in this route
 */
export function checkStructuredValidation(validationRules) {
  return function (req, res, next) {
    return async function () {
      req.validationFailed = false;
      // No route for some weird reason
      if (!req.route) {
        return next();
      }
      const route = req.route.path;
      if (!validationRules) {
        return next();
      }
      // Get this specific validation rule
      const ruleToUse = validationRules[route];
      // No validation rules for this endpoint
      if (!ruleToUse) {
        return next();
      }
      // Check for validation errors
      const body = Object.assign({}, req.body);
      const params = Object.assign({}, req.params);
      const valErrors = await runValidation(ruleToUse, convertBodyToStrings(body), convertBodyToStrings(params));
      // Return validation errors
      if (valErrors.length) {
        returnValidationErrors(res, valErrors);
        req.validationFailed = true;
        return;
      }
      next();
    }();
  }
}

/**
 * Convert all body props to string
 * @param body Req.body
 * @return {*}
 */
export function convertBodyToStrings(body) {
  const bodyStrings = {};
  // Convert everything to a string for validation
  for (let i in body) {
    if (body.hasOwnProperty(i)) {
      if (typeof body[i] !== 'undefined' && typeof body[i].toString === 'function') {
        bodyStrings[i] = body[i].toString();
      }
    }
  }
  return bodyStrings;
}

/**
 * Ensure that we have a decimal value, rather than an integer representation of percentages
 * @param next
 * @param props
 * @param propMaxes
 */
export function ensureDecimals(next, props, propMaxes = {}) {
  props.forEach(prop => {
    if (this[prop]) {
      // Make sure it's a decimal
      if (this[prop]) {
        this[prop] = parseFloat(this[prop]);
        let maxValue = 1;
        // margin could potentially be less than "1", but entered wrong. It will always be less than 10%
        if (propMaxes[prop]) {
          maxValue = propMaxes[prop];
        }
        if (this[prop] > maxValue) {
          this[prop] = (this[prop] / 100).toFixed(3);
        }
      }
    }
  });
  next();
}

function pushValError(valErrors, k, v) {
  valErrors.push({name: k, message: v.message});
}

/**
 * Return validation errors
 * @param res
 * @param valErrors Validation errors
 */
export function returnValidationErrors(res, valErrors) {
  return res.status(400).json({error: {errors: valErrors}});
}

/**
 * Run validation on a request body
 * @param validation Validation rules
 * @param body Request body
 * @param params Path params
 * @return {Array}
 */
export async function runValidation(validation, body, params = {}) {
  const valErrors = [];
  try {
    for (let [k, v] of Object.entries(validation)) {
      // Value in body
      let compareVal = _.get(body, k);
      // Value in params
      if (!compareVal) {
        compareVal = _.get(params, k);
      }
      compareVal = typeof compareVal === 'string' ? compareVal : '';

      if (_.isPlainObject(v)) {
        v = [v];
      }

      for (const thisV of v) {
        if (thisV.type && !validator[thisV.type](compareVal, thisV.options)) {
          // Invalid based on validator.js
          pushValError(valErrors, k, thisV);
        } else if (thisV.regex && !thisV.regex.test(compareVal)) {
          // Invalid based on regex
          pushValError(valErrors, k, thisV);
          // Check to make sure string does not match this regex
        } else if (thisV.notRegex && thisV.notRegex.test(compareVal)) {
          pushValError(valErrors, k, thisV);
        } else if (thisV.date && !moment(compareVal).isValid()) {
          // Invalid based on moment()
          pushValError(valErrors, k, thisV);
        } else if (thisV.rule && !thisV.rule(compareVal)) {
          // Invalid based on custom validation rule
          pushValError(valErrors, k, thisV);
        // Invalid based on record existence
        } else if (thisV.async && !await thisV.async(compareVal, models[thisV.model])) {
          // Invalid based on async validation rule
          pushValError(valErrors, k, thisV);
        } else if (thisV.enum && thisV.enum.indexOf(compareVal) === -1) {
          pushValError(valErrors, k, thisV);
        }
      }
    }
    return valErrors;
  } catch (err) {
    console.log('**************VALIDATION ERROR**********');
    console.log(err);
    return valErrors;
  }
}

/**
 * Err on the side of caution here
 */
export function isEmail(val) {
  return /.+@.+\..+/.test(val);
}

/**
 * Checks a given string to make sure it's not empty
 *
 * @param {String} val
 * @return {Boolean}
 */
export function isNotEmpty(val) {
  return validator.isLength(validator.trim(val), {min: 1});
}

/**
 * Check for valid objectId
 * @param val
 */
export function isObjectId(val) {
  return isValidObjectId(val);
}

/**
 * Test simple date format: YYYY-MM-DD
 * @param val
 * @return {boolean}
 */
export function isSimpleDate(val) {
  return /^\d{4}-\d{2}-\d{2}$/.test(val);
}

/**
 * Check if value is a string
 */
export function isString(val) {
  return typeof val === 'string';
}

/**
 * Check to see if a record exists
 * @param id
 * @param model
 * @return {Promise.<void>}
 */
export async function recordExists(id, model) {
  if (!isObjectId(id)) {
    return false;
  }
  return !!await model.findById(id);
}
