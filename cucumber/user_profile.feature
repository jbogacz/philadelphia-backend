

  Scenario: Updating user profile details
    Given I have a user profile
    When I update my profile:
      | Field       | Value           |
      | name        | John Doe        |
      | description | I am a creator  |
      | tags        | Creator, Artist |
      | location    | New York, USA   |
      | website     | www.johndoe.com |
    Then my profile should be updated
    And it should be visible to other users


