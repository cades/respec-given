describe 'these tests should fail', ->

  describe 'throw in Given', ->
    Given -> throw new Error('oops!')
    ThenError -> true

  describe 'throw in GivenI', ->
    GivenI 'xx', -> throw new Error('oops!')
    ThenError -> true

  describe 'throw in When', ->
    When -> throw new Error('oops!')
    ThenError -> true

  describe 'throw in Given (not Error)', ->
    Given -> throw 'oops!'
    ThenError -> true

  describe 'throw in GivenI (not Error)', ->
    GivenI 'xx', -> throw 'oops!'
    ThenError -> true

  describe 'throw in When (not Error)', ->
    When -> throw 'oops!'
    ThenError -> true
