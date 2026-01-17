Feature: BFF Health
  In order to ensure the BFF is running
  I want to check the health status

  Scenario: BFF is up
    When I request the health status
    Then the response status should be 200
    And the status should be "UP"
