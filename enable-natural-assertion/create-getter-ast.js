function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

module.exports = function(prop) {
  return {
    "type": "Property",
    "key": {
      "type": "Identifier",
      "name": prop
    },
    "computed": false,
    "value": {
      "type": "FunctionExpression",
      "id": {
        "type": "Identifier",
        "name": "get" + capitalizeFirstLetter(prop)
      },
      "params": [],
      "defaults": [],
      "body": {
        "type": "BlockStatement",
        "body": [
          {
            "type": "ReturnStatement",
            "argument": {
              "type": "Identifier",
              "name": prop
            }
          }
        ]
      },
      "generator": false,
      "expression": false
    },
    "kind": "init",
    "method": false,
    "shorthand": false
  }
}
