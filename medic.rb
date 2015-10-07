require './log_parser.rb'

log_path = ARGV[0]

filenames = Dir[File.join(log_path, "/l*.log")]

current_game = filenames.sort.last

puts "Watching " + current_game
f = File.open(current_game)
f.seek(0, IO::SEEK_END)

while (true)
  select([f])
  line = f.gets
  if (line)
    puts LogParser.parse_line(line)
  else
    sleep 0.1
  end
end
