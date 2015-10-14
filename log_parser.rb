require 'date'

class LogParser

  @messages = {
    round_start: /L (\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d): World triggered "Round_Start"/,
    round_win: /L (\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d): World triggered "Round_Win" \(winner "([^"]+)"\)/,
    round_length: /L (\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d): World triggered "Round_Length" \(seconds "([^"]+)"\)/,
    map: /L (\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d): Started map "([^"]+)"/,
    entered_game: /L (\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d): "([^<]+)<\d+><\[U:.:(\d+)\]><[^>]*>" entered the game/,
    left_game: /L (\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d): "([^<]+)<\d+><\[U:.:(\d+)\]>[^>]*>" disconnected/,
    moved_team: /L (\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d): "([^<]+)<\d+><\[U:.:(\d+)\]><([^>]*)>" joined team "([^"]+)"/,
    change_role: /L (\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d): "([^<]+)<\d+><\[U:.:(\d+)\]><([^>]+)>" changed role to "([^"]+)"/,
    kill: /L (\d\d\/\d\d\/\d\d\d\d) - (\d\d:\d\d:\d\d): "([^<]+)<\d+><\[U:.:(\d+)\]><([^>]+)>" killed "([^<]+)<.><\[U:.:(\d+)\]><([^>]+)>" with "([^"]+)"/
  }

  def self.parse_line(line)
    parsed = nil
    @messages.each do |type, regex|
      result = regex.match(line)
      if (result)
        timestamp = DateTime.strptime(result[1] + "T" + result[2], "%m/%d/%YT%H:%M:%S")
        parsed = {}
        if (type == :round_start)
          parsed[:type] = type
          parsed[:timestamp] = timestamp
        elsif (type == :round_win)
          parsed[:type] = type
          parsed[:timestamp] = timestamp
          parsed[:winning_team] = result[3]
        elsif (type == :round_length)
          parsed[:type] = type
          parsed[:timestamp] = timestamp
          parsed[:round_length] = result[3]
        elsif (type == :map)
          parsed[:type] = type
          parsed[:timestamp] = timestamp
          parsed[:map] = result[3]
        elsif (type == :entered_game)
          parsed[:type] = type
          parsed[:timestamp] = timestamp
          parsed[:nick] = result[3]
          parsed[:player_id] = result[4]
        elsif (type == :left_game)
          parsed[:type] = type
          parsed[:timestamp] = timestamp
          parsed[:nick] = result[3]
          parsed[:player_id] = result[4]
        elsif (type == :moved_team)
          parsed[:type] = type
          parsed[:timestamp] = timestamp
          parsed[:nick] = result[3]
          parsed[:player_id] = result[4]
          parsed[:original_team] = result[5]
          parsed[:target_team] = result[6]
        elsif (type == :change_role)
          parsed[:type] = type
          parsed[:timestamp] = timestamp
          parsed[:nick] = result[3]
          parsed[:player_id] = result[4]
          parsed[:team] = result[5]
          parsed[:role] = result[6]
        elsif (type == :kill)
          parsed[:type] = type
          parsed[:timestamp] = timestamp
          parsed[:nick] = result[3]
          parsed[:player_id] = result[4]
          parsed[:team] = result[5]
          parsed[:killed_nick] = result[6]
          parsed[:killed_player_id] = result[7]
          parsed[:killed_team] = result[8]
          parsed[:weapon] = result[9]
        end

        break
      end
    end

    if (parsed == nil)
      #puts line
    end
    parsed
  end
end
