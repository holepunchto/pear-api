'use strict'
class PearError extends Error {
  static ERR_INVALID_INPUT = ERR_INVALID_INPUT
  static ERR_INVALID_LINK = ERR_INVALID_LINK
  static ERR_INVALID_APPLING = ERR_INVALID_APPLING
  static ERR_INVALID_APP_NAME = ERR_INVALID_APP_NAME
  static ERR_INVALID_APP_STORAGE = ERR_INVALID_APP_STORAGE
  static ERR_INVALID_PROJECT_DIR = ERR_INVALID_PROJECT_DIR
  static ERR_INVALID_GC_RESOURCE = ERR_INVALID_GC_RESOURCE
  static ERR_INVALID_CONFIG = ERR_INVALID_CONFIG
  static ERR_INVALID_TEMPLATE = ERR_INVALID_TEMPLATE
  static ERR_PERMISSION_REQUIRED = ERR_PERMISSION_REQUIRED
  static ERR_INTERNAL_ERROR = ERR_INTERNAL_ERROR
  static ERR_UNSTAGED = ERR_UNSTAGED
  static ERR_DIR_NONEMPTY = ERR_DIR_NONEMPTY
  static ERR_OPERATION_FAILED = ERR_OPERATION_FAILED
  static ERR_SECRET_NOT_FOUND = ERR_SECRET_NOT_FOUND
  static ERR_CONNECTION = ERR_CONNECTION
  static ERR_INVALID_MANIFEST = ERR_INVALID_MANIFEST
  static ERR_ASSERTION = ERR_ASSERTION
  static ERR_UNKNOWN = ERR_UNKNOWN
  static ERR_LEGACY = ERR_LEGACY
  static known = known
  constructor (msg, fn = PearError, info = null, stackless = false) {
    super(msg)
    this.code = fn.name
    this.name = fn.name
    if (this.info !== null) this.info = info
    if (stackless) this.stack = this.message
    else if (Error.captureStackTrace) Error.captureStackTrace(this, fn)
  }
}

function known (prefix = 'ERR_', ...prefixes) {
  return [...Object.getOwnPropertyNames(PearError).filter((name) => name.startsWith(prefix)), ...prefixes.flatMap((prefix) => known(prefix))]
}

function ERR_INVALID_INPUT (msg, info = null) {
  return new PearError(msg, ERR_INVALID_INPUT, info)
}

function ERR_INVALID_LINK (msg, info = null) {
  return new PearError(msg, ERR_INVALID_LINK, info)
}

function ERR_INVALID_APPLING (msg, info = null) {
  return new PearError(msg, ERR_INVALID_APPLING, info)
}

function ERR_INVALID_APP_NAME (msg, info = null) {
  return new PearError(msg, ERR_INVALID_APP_NAME, info)
}

function ERR_INVALID_APP_STORAGE (msg, info = null) {
  return new PearError(msg, ERR_INVALID_APP_STORAGE, info)
}

function ERR_INVALID_PROJECT_DIR (msg, info = null) {
  return new PearError(msg, ERR_INVALID_PROJECT_DIR, info)
}

function ERR_INVALID_GC_RESOURCE (msg, info = null) {
  return new PearError(msg, ERR_INVALID_GC_RESOURCE, info)
}

function ERR_INVALID_CONFIG (msg, info = null) {
  return new PearError(msg, ERR_INVALID_CONFIG, info)
}

function ERR_INVALID_TEMPLATE (msg, info = null) {
  return new PearError(msg, ERR_INVALID_TEMPLATE, info)
}

function ERR_PERMISSION_REQUIRED (msg, info = {}) {
  return new PearError(msg, ERR_PERMISSION_REQUIRED, info)
}

function ERR_SECRET_NOT_FOUND (msg, info = null) {
  return new PearError(msg, ERR_SECRET_NOT_FOUND, info)
}

function ERR_CONNECTION (msg, info = null) {
  return new PearError(msg, ERR_CONNECTION, info)
}

function ERR_INVALID_MANIFEST (msg, info = null) {
  return new PearError(msg, ERR_INVALID_MANIFEST, info)
}

function ERR_INTERNAL_ERROR (msg, info = null) {
  return new PearError(msg, ERR_INTERNAL_ERROR, info)
}

function ERR_UNSTAGED (msg, info = null) {
  return new PearError(msg, ERR_UNSTAGED, info)
}

function ERR_DIR_NONEMPTY (msg, info = null) {
  return new PearError(msg, ERR_DIR_NONEMPTY, info)
}

function ERR_OPERATION_FAILED (msg, info = {}) {
  return new PearError(msg, ERR_OPERATION_FAILED, info)
}

function ERR_ASSERTION (msg, info = null) {
  return new PearError(msg, ERR_ASSERTION, info)
}

function ERR_UNKNOWN (msg, info = null) {
  return new PearError(msg, ERR_UNKNOWN, info)
}

function ERR_LEGACY (msg, info = null) {
  return new PearError(msg, ERR_LEGACY, info, true)
}

module.exports = PearError
