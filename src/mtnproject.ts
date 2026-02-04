// // https://www.mountainproject.com/rss/user-ticks/201166134
// // <rss xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">
// // <channel>
// // <title>Ticks for John Ottenlips Franke on Mountain Project</title>
// // <description>The Definitive Climbing Resource</description>
// // <link>https://www.mountainproject.com</link>
// // <language>en-us</language>
// // <lastBuildDate>Sat, 24 Jan 2026 19:09:10 +0000</lastBuildDate>
// // <item>
// // <title>Tick: Grape Vine (5.7)</title>
// // <link>https://www.mountainproject.com/route/121871647/grape-vine</link>
// // <guid isPermaLink="false">MPObject_202273988</guid>
// // <pubDate>Sat, 27 Dec 2025 21:06:07 +0000</pubDate>
// // <description><div class="fr-view"><p>Work through a low crux through a series of small ledges. Finish in a small dihedral just before the anchor. Watch out for lots of loose rock.</p></div><br /><img class="" src='https://mountainproject.com/assets/photos/climb/122083536_smallMed_1647451882_topo.jpg?cache=1714597316' alt="Really fun route!"><br><a href="https://www.mountainproject.com/area/105899020/missouri">Missouri</a> &gt; <a href="https://www.mountainproject.com/area/116617972/em-rockwoods-reservation">EM: Rockwoods R&hellip;</a> &gt; <a href="https://www.mountainproject.com/area/121388630/colony-wall">Colony Wall</a> </description>
// // </item>
// // <item>
// // <title>Tick: Xylem (5.10a)</title>
// // <link>https://www.mountainproject.com/route/121676838/xylem</link>
// // <guid isPermaLink="false">MPObject_202273688</guid>
// // <pubDate>Sat, 27 Dec 2025 19:56:10 +0000</pubDate>
// // <description><div class="fr-view"><p>Begin with a gentle slab start to a comfortable ledge rest, followed by more vertical climbing as the dihedral crack thins into the crux. &nbsp;Careful footwork and body position will help you gain the second ledge to clip the anchors. &nbsp;The dihedral provides some shade, which may be helpful in warmer weather.</p></div><br /><img class="" src='https://mountainproject.com/assets/photos/climb/126305529_smallMed_1717616410.jpg?cache=1725482195' alt="From Above"><br><a href="https://www.mountainproject.com/area/105899020/missouri">Missouri</a> &gt; <a href="https://www.mountainproject.com/area/116617972/em-rockwoods-reservation">EM: Rockwoods R&hellip;</a> &gt; <a href="https://www.mountainproject.com/area/121388630/colony-wall">Colony Wall</a> </description>
// // </item>
// // <item>

// // craswl mtn project urls for route stats
// import fetch from "node-fetch";
// import * as xml2js from "xml2js";

// export const fetchMountainProjectTicks = async (
//   userId: string
// ): Promise<any[]> => {
//   const url = `https://www.mountainproject.com/rss/user-ticks/${userId}`;
//   const response = await fetch(url);
//   const xmlData = await response.text();

//   const parser = new xml2js.Parser();
//   const result = await parser.parseStringPromise(xmlData);

//   const items = result.rss.channel[0].item;
//   return items.map((item: any) => ({
//     title: item.title[0],
//     link: item.link[0],
//     pubDate: item.pubDate[0],
//     description: item.description[0],
//   }));
// };
// // get route height
// export const fetchRouteHeight = async (routeUrl: string): Promise<string> => {
//   const response = await fetch(routeUrl);
//   const htmlData = await response.text();
//   const heightMatch = htmlData.match(
//     /<li><strong>Height:<\/strong>\s*([\d\sftm]+)/
//   );
//   if (heightMatch && heightMatch[1]) {
//     return heightMatch[1].trim();
//   }
//   return "Unknown";
// };
// // Example usage:
// // (async () => {
// //   const ticks = await fetchMountainProjectTicks("201166134");
// //   for (const tick of ticks) {
// //     const height = await fetchRouteHeight(tick.link);
// //     console.log(`${tick.title} - Height: ${height}`);
// //   }
// // })();
