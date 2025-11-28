import { parseFile } from 'music-metadata';
import { readdir, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Formats duration in seconds to MM:SS or HH:MM:SS
 */
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Extracts episode info from filename
 * Expected format: episode-XXX-YYYYMMDD.mp3
 */
function parseFilename(filename) {
  const match = filename.match(/episode-(\d+)-(\d{8})\.mp3$/);
  if (!match) return null;

  const [, episodeNum, dateStr] = match;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);

  return {
    id: `ep${episodeNum}`,
    publishedAt: `${year}-${month}-${day}`
  };
}

async function buildEpisodes() {
  const audioDir = 'assets/audio';
  const outputFile = 'assets/episodes.json';

  console.log('🎵 Scanning MP3 files in', audioDir);

  try {
    const files = await readdir(audioDir);
    const mp3Files = files.filter(f => f.endsWith('.mp3')).sort();

    console.log(`Found ${mp3Files.length} MP3 file(s)`);

    const episodes = [];

    for (const file of mp3Files) {
      const filePath = join(audioDir, file);
      console.log(`\n📀 Processing: ${file}`);

      const fileInfo = parseFilename(file);
      if (!fileInfo) {
        console.warn(`⚠️  Skipping ${file} - doesn't match expected format`);
        continue;
      }

      try {
        const metadata = await parseFile(filePath);

        const duration = metadata.format.duration
          ? formatDuration(metadata.format.duration)
          : '0:00';

        const title = metadata.common.title || `Episode ${fileInfo.id}`;
        const description = metadata.common.comment?.[0] ||
                          metadata.common.description ||
                          `Episode ${fileInfo.id}`;

        const episode = {
          id: fileInfo.id,
          title: title,
          description: description,
          duration: duration,
          fileUrl: `assets/audio/${file}`,
          publishedAt: fileInfo.publishedAt
        };

        console.log(`  ✅ Duration: ${duration}`);
        console.log(`  📝 Title: ${title}`);

        episodes.push(episode);
      } catch (err) {
        console.error(`❌ Error reading metadata for ${file}:`, err.message);
      }
    }

    // Sort by publishedAt (newest first)
    episodes.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    const json = JSON.stringify(episodes, null, 2);
    await writeFile(outputFile, json + '\n', 'utf8');

    console.log(`\n✨ Successfully generated ${outputFile} with ${episodes.length} episode(s)`);

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

buildEpisodes();
