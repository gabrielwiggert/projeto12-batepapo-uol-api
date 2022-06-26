import { exec } from "child_process";
import request from "../utils/request";

jest.setTimeout(15000);
const sleep = timeout => new Promise(resolve => setTimeout(() => resolve(), timeout));
class ServerData {
  constructor() {
    this._process = null;
    this._lastCommand = null;
  }

  get process() {
    return this._process;
  }

  async setProcess(newValueSetter) {
    if (this._process !== null) {
      exec(`kill -9 ${this._process.pid}`);
      exec(`kill -9 ${this._process.pid + 1}`);
      await sleep(2500);
    }

    await(2500);
    this._process = newValueSetter();
  }
}

const server = new ServerData();

afterAll(() => {
  server.setProcess(() => null);
});

async function _setup() {
  await server.setProcess(() => exec('node src/app'));
  server.process.stdout.on('data', chunk => console.log(chunk.toString()));
  server.process.stderr.on('data', chunk => console.log(chunk.toString()));
  await sleep(2000);
}

describe("GET /forecast", () => {
  it("should respond with an array of forecasts", async () => {
    await _setup();

    const res = await request.get("/forecast");

    for (const forecast of res.data) {
      expect(forecast).toEqual({
        day: expect.any(Number),
        temperature: expect.any(String),
        wind: expect.any(String),
        views: expect.any(Number)
      });
    }
  });
});

describe("GET /forecast/:day", () => {
  it("should respond with the desired forecast", async () => {
    await _setup();
    const res = await request.get("/forecast/1");

    expect(res.data).toEqual({
      day: expect.any(Number),
      temperature: expect.any(String),
      wind: expect.any(String),
      views: expect.any(Number)
    });
  });

  it("should increase the number of views", async () => {
    await _setup();
    const resBefore = await request.get("/forecast/1");
    const res = await request.get("/forecast/1");

    expect(res.data).toEqual({
      day: expect.any(Number),
      temperature: expect.any(String),
      wind: expect.any(String),
      views: resBefore.data.views + 1
    });
  });
});
