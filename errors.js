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
  static ERR_NOT_FOUND_OR_NOT_CONNECTED = ERR_NOT_FOUND_OR_NOT_CONNECTED
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

function ERR_INVALID_INPUT (msg) {
  return new PearError(msg, ERR_INVALID_INPUT)
}

function ERR_INVALID_LINK (msg) {
  return new PearError(msg, ERR_INVALID_LINK)
}

function ERR_INVALID_APPLING (msg) {
  return new PearError(msg, ERR_INVALID_APPLING)
}

function ERR_INVALID_APP_NAME (msg) {
  return new PearError(msg, ERR_INVALID_APP_NAME)
}

function ERR_INVALID_APP_STORAGE (msg) {
  return new PearError(msg, ERR_INVALID_APP_STORAGE)
}

function ERR_INVALID_PROJECT_DIR (msg) {
  return new PearError(msg, ERR_INVALID_PROJECT_DIR)
}

function ERR_INVALID_GC_RESOURCE (msg) {
  return new PearError(msg, ERR_INVALID_GC_RESOURCE)
}

function ERR_INVALID_CONFIG (msg) {
  return new PearError(msg, ERR_INVALID_CONFIG)
}

function ERR_INVALID_TEMPLATE (msg) {
  return new PearError(msg, ERR_INVALID_TEMPLATE)
}

function ERR_PERMISSION_REQUIRED (msg, info = {}) {
  return new PearError(msg, ERR_PERMISSION_REQUIRED, info)
}

function ERR_SECRET_NOT_FOUND (msg) {
  return new PearError(msg, ERR_SECRET_NOT_FOUND)
}

function ERR_NOT_FOUND_OR_NOT_CONNECTED (msg) {
  return new PearError(msg, ERR_NOT_FOUND_OR_NOT_CONNECTED)
}

function ERR_INVALID_MANIFEST (msg) {
  return new PearError(msg, ERR_INVALID_MANIFEST)
}

function ERR_INTERNAL_ERROR (msg) {
  return new PearError(msg, ERR_INTERNAL_ERROR)
}

function ERR_UNSTAGED (msg) {
  return new PearError(msg, ERR_UNSTAGED)
}

function ERR_DIR_NONEMPTY (msg) {
  return new PearError(msg, ERR_DIR_NONEMPTY)
}

function ERR_OPERATION_FAILED (msg, info = {}) {
  return new PearError(msg, ERR_OPERATION_FAILED, info)
}

function ERR_ASSERTION (msg) {
  return new PearError(msg, ERR_ASSERTION)
}

function ERR_UNKNOWN (msg) {
  return new PearError(msg, ERR_UNKNOWN)
}

function ERR_LEGACY (msg) {
  return new PearError(msg, ERR_LEGACY, null, true)
}

module.exports = PearError
