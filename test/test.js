const request = require('supertest');
const casual = require("casual")
const app = require('../app');
const db = require('../models');

describe('App', function () {
  it('has the default page', function (done) {
    request(app)
      .get('/api')
      .expect("Hello There!", done);
  });
});

describe('USER TEST', () => {
  let userdata = {}
  beforeEach(async () => {
    // await db.sequelize.sync({ force: true });
    userdata = {
      firstName: casual.first_name,
      lastName: casual.last_name,
      birthday: casual.date(format = 'YYYY-MM-DD'),
      latitude: casual.latitude,
      longtitude: casual.longitude
    }
  });

  describe('POST /api/user', function () {
    it('creating user', function (done) {
      request(app)
        .post('/api/user')
        .send(userdata)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });
  });

  describe('PUT /api/user/:id', function () {
    it('updating user', async () => {
      const { latitude, longtitude, ...payload } = userdata
      userdata.location = JSON.stringify({ latitude, longtitude })
      const data = await db.user.create(userdata);
      request(app)
        .put(`/api/user/${data.id}`)
        .send(userdata)
        .expect(200)
    });
  });

  describe('DELETE /api/user/:id', function () {
    it('deleting user', async () => {
      const { latitude, longtitude, ...payload } = userdata
      userdata.location = JSON.stringify({ latitude, longtitude })
      const data = await db.user.create(userdata);
      request(app)
        .del(`/api/user/${data.id}`)
        .expect(200)
        .then()
    });
  });
})

