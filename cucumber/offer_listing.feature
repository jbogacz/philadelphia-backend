Feature: Create Offer Listing
  As a marketplace user
  I want to create a listing for services I can provide
  So that I can offer my traffic/audience growth capabilities

  Background:
    Given I am logged in
    And I have a verified profile

  Scenario: Creating a traffic service offering
    When I create an offer listing with:
      | Field             | Value                       |
      | title             | Instagram Growth Service    |
      | platforms         | Instagram, TikTok           |
      | service_type      | Organic Growth              |
      | reach             | 50k+ monthly views          |
      | price             | $300/month                  |
      | delivery_time     | 30 days                     |
      | included_services | Analytics, Content Strategy |
    Then the offer listing should be created
    And it should appear in search results
    And matching seekers should be notified
