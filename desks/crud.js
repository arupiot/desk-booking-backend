// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const bodyParser = require('body-parser');

function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({ extended: false }));

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

/**
 * GET /desks
 *
 * Display a page of desks (up to thirty at a time).
 */
router.get('/', (req, res, next) => {
  getModel().list(30, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    
    res.render('desks/list.pug', {
      desks: entities,
      nextPageToken: cursor
    });
  });
});

/**
 * GET /desks/add
 *
 * Display a form for creating a desk.
 */
// [START add_get]
router.get('/add', (req, res) => {
  res.render('desks/form.pug', {
    desk: {},
    action: 'Add'
  });
});
// [END add_get]

/**
 * POST /desks/add
 *
 * Create a desk.
 */
// [START add_post]
router.post('/add', (req, res, next) => {
  const data = req.body;

  // Save the data to the database.
  getModel().create(data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  });
});
// [END add_post]

/**
 * GET /desks/:id/edit
 *
 * Display a desk for editing.
 */
router.get('/:desk/edit', (req, res, next) => {
  getModel().read(req.params.desk, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('desks/form.pug', {
      desk: entity,
      action: 'Edit'
    });
  });
});

/**
 * POST /desks/:id/edit
 *
 * Update a desk.
 */
router.post('/:desk/edit', (req, res, next) => {
  const data = req.body;

  getModel().update(req.params.desk, data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  });
});

/**
 * GET /desks/:id
 *
 * Display a desk.
 */
router.get('/:desk', (req, res, next) => {
  getModel().read(req.params.desk, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('desks/view.pug', {
      desk: entity
    });
  });
});

/**
 * GET /desks/:id/delete
 *
 * Delete a desk.
 */
router.get('/:desk/delete', (req, res, next) => {
  getModel().delete(req.params.desk, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

/**
 * Errors on "/desks/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = err.message;
  next(err);
});

module.exports = router;
