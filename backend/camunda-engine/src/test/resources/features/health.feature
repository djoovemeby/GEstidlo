Feature: Camunda Engine Health
  In order to ensure the Process Engine is running
  I want to check the health status

  Scenario: Engine is up
    When I request the health status
    Then the response status should be 200
    And the status should be "UP"
