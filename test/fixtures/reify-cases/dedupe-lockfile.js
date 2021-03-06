// generated from test/fixtures/dedupe-lockfile
module.exports = t => {
  const path = t.testdir({
  "package-lock.json": JSON.stringify({
    "name": "dedupe-lockfile",
    "version": "1.0.0",
    "lockfileVersion": 2,
    "requires": true,
    "packages": {
      "": {
        "name": "dedupe-lockfile",
        "version": "1.0.0",
        "dependencies": {
          "@isaacs/dedupe-tests-a": "1.0.1",
          "@isaacs/dedupe-tests-b": "1||2"
        }
      },
      "node_modules/@isaacs/dedupe-tests-a": {
        "name": "@isaacs/dedupe-tests-a",
        "version": "1.0.1",
        "resolved": "https://registry.npmjs.org/@isaacs/dedupe-tests-a/-/dedupe-tests-a-1.0.1.tgz",
        "integrity": "sha512-8AN9lNCcBt5Xeje7fMEEpp5K3rgcAzIpTtAjYb/YMUYu8SbIVF6wz0WqACDVKvpQOUcSfNHZQNLNmue0QSwXOQ==",
        "dependencies": {
          "@isaacs/dedupe-tests-b": "1"
        }
      },
      "node_modules/@isaacs/dedupe-tests-a/node_modules/@isaacs/dedupe-tests-b": {
        "name": "@isaacs/dedupe-tests-b",
        "version": "1.0.0",
        "resolved": "https://registry.npmjs.org/@isaacs/dedupe-tests-b/-/dedupe-tests-b-1.0.0.tgz",
        "integrity": "sha512-3nmvzIb8QL8OXODzipwoV3U8h9OQD9g9RwOPuSBQqjqSg9JZR1CCFOWNsDUtOfmwY8HFUJV9EAZ124uhqVxq+w=="
      },
      "node_modules/@isaacs/dedupe-tests-b": {
        "name": "@isaacs/dedupe-tests-b",
        "version": "2.0.0",
        "resolved": "https://registry.npmjs.org/@isaacs/dedupe-tests-b/-/dedupe-tests-b-2.0.0.tgz",
        "integrity": "sha512-KTYkpRv9EzlmCg4Gsm/jpclWmRYFCXow8GZKJXjK08sIZBlElTZEa5Bw/UQxIvEfcKmWXczSqItD49Kr8Ax4UA=="
      }
    },
    "dependencies": {
      "@isaacs/dedupe-tests-a": {
        "version": "1.0.1",
        "resolved": "https://registry.npmjs.org/@isaacs/dedupe-tests-a/-/dedupe-tests-a-1.0.1.tgz",
        "integrity": "sha512-8AN9lNCcBt5Xeje7fMEEpp5K3rgcAzIpTtAjYb/YMUYu8SbIVF6wz0WqACDVKvpQOUcSfNHZQNLNmue0QSwXOQ==",
        "requires": {
          "@isaacs/dedupe-tests-b": "1"
        },
        "dependencies": {
          "@isaacs/dedupe-tests-b": {
            "version": "1.0.0",
            "resolved": "https://registry.npmjs.org/@isaacs/dedupe-tests-b/-/dedupe-tests-b-1.0.0.tgz",
            "integrity": "sha512-3nmvzIb8QL8OXODzipwoV3U8h9OQD9g9RwOPuSBQqjqSg9JZR1CCFOWNsDUtOfmwY8HFUJV9EAZ124uhqVxq+w=="
          }
        }
      },
      "@isaacs/dedupe-tests-b": {
        "version": "2.0.0",
        "resolved": "https://registry.npmjs.org/@isaacs/dedupe-tests-b/-/dedupe-tests-b-2.0.0.tgz",
        "integrity": "sha512-KTYkpRv9EzlmCg4Gsm/jpclWmRYFCXow8GZKJXjK08sIZBlElTZEa5Bw/UQxIvEfcKmWXczSqItD49Kr8Ax4UA=="
      }
    }
  }),
  "package.json": JSON.stringify({
    "name": "dedupe-lockfile",
    "version": "1.0.0",
    "dependencies": {
      "@isaacs/dedupe-tests-a": "1.0.1",
      "@isaacs/dedupe-tests-b": "1||2"
    }
  })
})
  return path
}
