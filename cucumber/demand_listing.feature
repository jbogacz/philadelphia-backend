# features/demand_listing.feature
Feature: Create Demand Listing
  As a marketplace user
  I want to create a listing for services I need
  So that I can find providers for my traffic/audience needs

  Background:
    Given I am logged in
    And I have a complete profile

  Scenario: Creating a traffic demand listing
    When I create a demand listing with:
      | Field             | Value                  |
      | title             | Need Instagram Growth  |
      | target_platform   | Instagram              |
      | growth_target     | 10k real followers     |
      | timeframe         | 30 days                |
      | budget            | $500                   |
      | requirements      | Must be niche relevant |
      | compensation_type | Cash                   |
    Then the demand listing should be created
    And it should be visible in the marketplace
    And matching providers should be notified

  Scenario: Creating a barter demand listing
    When I create a demand listing with:
      | Field             | Value                        |
      | title             | TikTok Growth - Barter Offer |
      | target_platform   | TikTok                       |
      | growth_target     | 5k followers                 |
      | timeframe         | 60 days                      |
      | compensation_type | Barter                       |
      | barter_offer      | Free meals at my restaurant  |
      | barter_value      | $600 worth of meals          |
    Then the barter listing should be created
    And it should show in barter category
    And potential trade partners should be notified
