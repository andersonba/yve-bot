---
title: Rule Types
---

# StringSearch Rule
```yaml
- message: Insert your city name
  name: city
  type: StringSearch
  config:
    apiURI: https://myserver.citysearch.com/search
    apiQueryParam: q
    translate:
      label: title
      value: tid
    messages:
      yes: Suuuuuuure!
      no: HELL NO!
      wrongResult: Hmm.. okay, tell me your city again
      noResults: I couldn't find any cities with this input. Try again
      didYouMean: Did you mean
      noneOfAbove: None of those
      multipleResults: I've found those cities for your input
  validators:
    - minWords: 1
```

| Property | Description |
|----------|-------------|
| config.apiUrl | Api root URL
| config.apiQueryParam | Param to be appended in url. Result: `${apiURI}?${apiQueryParam}=${answer}`
| config.translate | Will be used to map your server response to our expected format ({ label, value }). It's necessary to set which of your server's response properties will be our label and which one will be the actual value.
| config.messages.wrongResult | when user choose 'noneOfAbove' option
| config.messages.noResults | when your server returns an empty array
| config.messages.didYouMean | when your server returns only 1 result
| config.messages.noneOfAbove | extra options to allow users choose none of server's responses
| config.messages.multipleResults | message that will be prompted to users when server returns more than one response
| config.messages.[yes\|no] | Messages of yes/no labels to confirm/deny server results based on user's input


[Back: Rule Specification]({{ site.baseurl }}/docs/rule){:.btn}
