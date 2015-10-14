require 'parse-ruby-client'
require 'yaml'


class ParseClient

	def self.init
		config = YAML.load_file('config.yml')
		Parse.init application_id: config['parse']['application_id'], api_key: config['parse']['api_key']
	end

	def self.sendEvent(eventData)
		event = Parse::Object.new("Event")
		event["name"] = eventData[:type]
		event["eventData"] = eventData
		puts event.save
	end

end

ParseClient.init
