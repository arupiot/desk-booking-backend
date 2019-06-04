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

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /api/desks
 *
 * Retrieve a page of desks (up to ten at a time).
 */
router.get('/', (req, res, next) => {
  getModel().list(30, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.json({
      items: entities,
      nextPageToken: cursor
    });
  });
});

/**
 * POST /api/desks
 *
 * Create a new desk
 * 
 * 
 */
router.post('/', (req, res, next) => {
  getModel().create(req.body, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});

/**
 * GET /api/desks/:id
 *
 * Retrieve a desk.
 */
router.get('/:desk', (req, res, next) => {
  getModel().read(req.params.desk, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.json(entity);
  });
});

/**
 * PUT /api/desks/:id
 *
 * Update a desk.
 */
// router.put('/:desk', (req, res, next) => {
//   getModel().update(req.params.desk, req.body, (err, entity) => {
//     if (err) {
//       next(err);
//       return;
//     }
//     res.json(entity);
//   });
// });

/**
 * DELETE /api/desks/:id
 *
 * Delete a desk.
 */
// router.delete('/:desk', (req, res, next) => {
//   getModel().delete(req.params.desk, (err) => {
//     if (err) {
//       next(err);
//       return;
//     }
//     res.status(200).send('OK');
//   });
// });

router.get('/:desk/unbook', (req, res, next) => {

  const enabled = true;

  if (enabled) {
    
    getModel().read(req.params.desk, (err, entity) => {
      if (err) {
        next(err);
        return;
      }

      entity.booked = false;
      entity.user_email = null;

      getModel().update(req.params.desk, entity, null, (err, entity) => {
        if (err) {
          next(err);
          return;
        }
        res.status(200).send("<h1>" + entity.name + " unbooked!</h1><a href='/' style='font-size: 180%'>&#8592; Back</a>");
      });
      
    });

  } else {
    console.log('Unbook by desk id is disabled!');
    res.status(200).send(':desk id unbooking endpoint is not enabled, my apologies');
  }

});

/**
 * GET api/desks/test/unbook
 *
 * To be extended...
 */

router.get('/test/unbook', (req, res, next) => {

  const enabled = false;

  if (enabled) {
    getModel().list(30, req.query.pageToken, (err, entities, cursor) => {
      if (err) {
        next(err);
        return;
      }
  
      // set 'booked' in selected desks to 'false'
  
      const updated = entities.map( desk => {
  
        if (desk.name === 'rory_test' || desk.name === 'lilac-spijkenisse' || desk.name === 'susie-storm') {
          desk.booked = false;
          desk.user_email = '';
        }
  
        const unbookedDesk = desk;
        
        return unbookedDesk 
      });
  
      getModel().update(null, null, updated, (err, savedData) => {
        if (err) {
          next(err);
          console.log("Something went horribly wrong with the test unbooking VIA API...");
          return;
        }
        console.log("test desks unbooked VIA API");
        res.status(200).send('done!');
      });
      
    });
  } else {
    console.log('TEST unbooking endpoint is not enabled...');
    res.status(200).send('TEST unbooking endpoint is not enabled, my apologies');
  }

});


/**
 * GET api/desks/all/unbook
 *
 * 
 */

router.get('/all/unbook', (req, res, next) => {

  const enabled = false;

  if (enabled) {
    getModel().list(30, req.query.pageToken, (err, entities, cursor) => {
      if (err) {
        next(err);
        return;
      }
  
      // set 'booked' in all desks to 'true'
  
      const updated = entities.map( desk => {
  
        if (desk.hotdesk) {
          desk.booked = false;
          desk.user_email = '';
        }
  
        const unbookedDesk = desk;
        
        return unbookedDesk 
      });
  
      getModel().update(null, null, updated, (err, savedData) => {
        if (err) {
          next(err);
          console.log("Something went horribly wrong with the bulk unbooking VIA API...");
          return;
        }
        console.log("All desks unbooked VIA API");
        res.status(200).send('done!');
      });
      
    });
  } else {
    console.log('unbooking endpoint is not enabled...');
    res.status(200).send('Bulk unbooking endpoint is not enabled, my apologies');
  }

});

/**
 * Errors on "/api/desks/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = {
    message: err.message,
    internalCode: err.code
  };
  next(err);
});

module.exports = router;
