import http from "http";

export default {
  get (route) {
    return new Promise((resolve, reject) => {
      http.request({
        hostname: 'localhost',
        port: 5000,
        path: route,
        method: 'GET'
      }, res => {
        let response = '';
        
        res.setEncoding('utf8');

        res.on('data', chunk => {
          response += chunk;
        });

        res.on('end', () => {
          resolve({ data: JSON.parse(response) });
        });

        res.on('error', err => {
          reject(err);
        });
      }).end();
    });
  }
};
