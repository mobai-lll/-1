import { Config, Destroy, Init, Provide } from "@midwayjs/core";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

@Provide()
export class DatabaseService {
  @Config("courseDatabase.path")
  databasePath: string;

  private database: DatabaseSync;

  @Init()
  async initialize() {
    const absolutePath = resolve(process.cwd(), this.databasePath);
    mkdirSync(dirname(absolutePath), { recursive: true });
    this.database = new DatabaseSync(absolutePath);
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        logo TEXT DEFAULT '',
        group_name TEXT DEFAULT '',
        description TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.database.exec(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        home_team_id INTEGER NOT NULL,
        away_team_id INTEGER NOT NULL,
        group_name TEXT DEFAULT '',
        round TEXT DEFAULT 'group',
        status TEXT NOT NULL DEFAULT 'scheduled',
        start_time TEXT NOT NULL,
        home_score INTEGER,
        away_score INTEGER,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (home_team_id) REFERENCES teams(id),
        FOREIGN KEY (away_team_id) REFERENCES teams(id)
      )
    `);

    this.database.exec(`
      CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        home_score INTEGER NOT NULL,
        away_score INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(id),
        UNIQUE(match_id, user_id)
      )
    `);

    this.database.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(id)
      )
    `);

    this.database.exec(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(id),
        UNIQUE(match_id, user_id)
      )
    `);

    this.database.exec(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        number INTEGER NOT NULL,
        age INTEGER NOT NULL,
        goals INTEGER DEFAULT 0,
        assists INTEGER DEFAULT 0,
        appearances INTEGER DEFAULT 0,
        yellow_cards INTEGER DEFAULT 0,
        red_cards INTEGER DEFAULT 0,
        FOREIGN KEY (team_id) REFERENCES teams(id)
      )
    `);

    this.initializeTeams();
    this.initializeMatches();
    this.initializePlayers();
  }

  private initializeTeams() {
    const row = this.database
      .prepare("SELECT COUNT(*) AS total FROM teams")
      .get() as { total: number };

    if (row.total === 0) {
      const insert = this.database.prepare(
        "INSERT INTO teams (name, country, logo, group_name, description) VALUES (?, ?, ?, ?, ?)",
      );
      // A组：墨西哥、南非、韩国、捷克
      insert.run(
        "Mexico",
        "Mexico",
        "🇲🇽",
        "Group A",
        "东道主之一，北美足球强国",
      );
      insert.run(
        "South Africa",
        "South Africa",
        "🇿🇦",
        "Group A",
        "非洲球队，曾举办2010世界杯",
      );
      insert.run(
        "South Korea",
        "South Korea",
        "🇰🇷",
        "Group A",
        "亚洲劲旅，2002年四强",
      );
      insert.run(
        "Czech Republic",
        "Czech Republic",
        "🇨🇿",
        "Group A",
        "欧洲球队，东欧足球代表",
      );
      // B组：加拿大、波黑、卡塔尔、瑞士
      insert.run(
        "Canada",
        "Canada",
        "🇨🇦",
        "Group B",
        "东道主之一，北美新兴力量",
      );
      insert.run(
        "Bosnia and Herzegovina",
        "Bosnia and Herzegovina",
        "🇧🇦",
        "Group B",
        "欧洲球队，巴尔干半岛足球代表",
      );
      insert.run(
        "Qatar",
        "Qatar",
        "🇶🇦",
        "Group B",
        "2022世界杯东道主，亚洲球队",
      );
      insert.run(
        "Switzerland",
        "Switzerland",
        "🇨🇭",
        "Group B",
        "欧洲劲旅，防守坚韧",
      );
      // C组：巴西、摩洛哥、海地、苏格兰
      insert.run("Brazil", "Brazil", "🇧🇷", "Group C", "五星巴西，桑巴足球代表");
      insert.run(
        "Morocco",
        "Morocco",
        "🇲🇦",
        "Group C",
        "2022四强，非洲足球之光",
      );
      insert.run("Haiti", "Haiti", "🇭🇹", "Group C", "加勒比海球队，黑马潜力");
      insert.run(
        "Scotland",
        "Scotland",
        "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
        "Group C",
        "欧洲老牌球队，苏格兰格子军团",
      );
      // D组：美国、巴拉圭、澳大利亚、土耳其
      insert.run(
        "United States",
        "United States",
        "🇺🇸",
        "Group D",
        "东道主之一，北美强队",
      );
      insert.run(
        "Paraguay",
        "Paraguay",
        "🇵🇾",
        "Group D",
        "南美球队，防守反击见长",
      );
      insert.run(
        "Australia",
        "Australia",
        "🇦🇺",
        "Group D",
        "大洋洲冠军，身体强壮",
      );
      insert.run(
        "Turkey",
        "Turkey",
        "🇹🇷",
        "Group D",
        "欧洲球队，亚欧大陆交汇处",
      );
      // E组：德国、库拉索、科特迪瓦、厄瓜多尔
      insert.run("Germany", "Germany", "🇩🇪", "Group E", "四星德国，德意志战车");
      insert.run(
        "Curacao",
        "Curacao",
        "🇨🇼",
        "Group E",
        "加勒比海小国，历史首次参赛",
      );
      insert.run(
        "Ivory Coast",
        "Ivory Coast",
        "🇨🇮",
        "Group E",
        "非洲劲旅，拥有多名英超球员",
      );
      insert.run(
        "Ecuador",
        "Ecuador",
        "🇪🇨",
        "Group E",
        "南美球队，高原主场优势",
      );
      // F组：荷兰、日本、瑞典、突尼斯
      insert.run(
        "Netherlands",
        "Netherlands",
        "🇳🇱",
        "Group F",
        "欧洲无冕之王，橙色军团",
      );
      insert.run("Japan", "Japan", "🇯🇵", "Group F", "亚洲技术流代表，蓝武士");
      insert.run("Sweden", "Sweden", "🇸🇪", "Group F", "北欧球队，身体对抗出色");
      insert.run("Tunisia", "Tunisia", "🇹🇳", "Group F", "非洲球队，防守稳固");
      // G组：比利时、埃及、伊朗、新西兰
      insert.run(
        "Belgium",
        "Belgium",
        "🇧🇪",
        "Group G",
        "欧洲红魔，黄金一代末期",
      );
      insert.run("Egypt", "Egypt", "🇪🇬", "Group G", "非洲球队，萨拉赫领军");
      insert.run("Iran", "Iran", "🇮🇷", "Group G", "亚洲劲旅，波斯铁骑");
      insert.run(
        "New Zealand",
        "New Zealand",
        "🇳🇿",
        "Group G",
        "大洋洲球队，全白军团",
      );
      // H组：西班牙、佛得角、沙特、乌拉圭
      insert.run("Spain", "Spain", "🇪🇸", "Group H", "传控足球代表，斗牛士军团");
      insert.run(
        "Cape Verde",
        "Cape Verde",
        "🇨🇻",
        "Group H",
        "非洲小国，历史首次参赛",
      );
      insert.run(
        "Saudi Arabia",
        "Saudi Arabia",
        "🇸🇦",
        "Group H",
        "亚洲劲旅，绿鹰",
      );
      insert.run(
        "Uruguay",
        "Uruguay",
        "🇺🇾",
        "Group H",
        "南美双冠王，苏亚雷斯领军",
      );
      // I组：法国、塞内加尔、伊拉克、挪威
      insert.run("France", "France", "🇫🇷", "Group I", "卫冕冠军，姆巴佩领衔");
      insert.run("Senegal", "Senegal", "🇸🇳", "Group I", "非洲冠军，马内领军");
      insert.run("Iraq", "Iraq", "🇮🇶", "Group I", "亚洲球队，两河流域足球代表");
      insert.run("Norway", "Norway", "🇳🇴", "Group I", "欧洲球队，哈兰德领衔");
      // J组：阿根廷、阿尔及利亚、奥地利、约旦
      insert.run(
        "Argentina",
        "Argentina",
        "🇦🇷",
        "Group J",
        "卫冕冠军，梅西最后一舞",
      );
      insert.run("Algeria", "Algeria", "🇩🇿", "Group J", "非洲球队，沙漠之狐");
      insert.run(
        "Austria",
        "Austria",
        "🇦🇹",
        "Group J",
        "欧洲球队，阿尔卑斯山雄鹰",
      );
      insert.run("Jordan", "Jordan", "🇯🇴", "Group J", "亚洲球队，历史首次参赛");
      // K组：葡萄牙、刚果(金)、乌兹别克斯坦、哥伦比亚
      insert.run(
        "Portugal",
        "Portugal",
        "🇵🇹",
        "Group K",
        "欧洲劲旅，C罗最后一舞",
      );
      insert.run(
        "DR Congo",
        "DR Congo",
        "🇨🇩",
        "Group K",
        "非洲球队，中部非洲足球代表",
      );
      insert.run(
        "Uzbekistan",
        "Uzbekistan",
        "🇺🇿",
        "Group K",
        "中亚球队，历史首次参赛",
      );
      insert.run("Colombia", "Colombia", "🇨🇴", "Group K", "南美球队，J罗领军");
      // L组：英格兰、克罗地亚、加纳、巴拿马
      insert.run(
        "England",
        "England",
        "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        "Group L",
        "三狮军团，欧洲传统强队",
      );
      insert.run(
        "Croatia",
        "Croatia",
        "🇭🇷",
        "Group L",
        "2018亚军，莫德里奇最后一舞",
      );
      insert.run("Ghana", "Ghana", "🇬🇭", "Group L", "非洲球队，黑星军团");
      insert.run(
        "Panama",
        "Panama",
        "🇵🇦",
        "Group L",
        "中美洲球队，历史第二次参赛",
      );
    }
  }

  private initializeMatches() {
    const row = this.database
      .prepare("SELECT COUNT(*) AS total FROM matches")
      .get() as { total: number };

    if (row.total === 0) {
      const insert = this.database.prepare(
        "INSERT INTO matches (home_team_id, away_team_id, group_name, round, status, start_time, home_score, away_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      );

      // A组小组赛（真实比分）
      insert.run(
        1,
        2,
        "Group A",
        "group",
        "completed",
        "2026-06-11T18:00:00Z",
        2,
        0,
      ); // 墨西哥2-0南非
      insert.run(
        3,
        4,
        "Group A",
        "group",
        "completed",
        "2026-06-11T21:00:00Z",
        2,
        1,
      ); // 韩国2-1捷克
      insert.run(
        4,
        2,
        "Group A",
        "group",
        "completed",
        "2026-06-18T18:00:00Z",
        1,
        1,
      ); // 捷克1-1南非
      insert.run(
        1,
        3,
        "Group A",
        "group",
        "completed",
        "2026-06-18T21:00:00Z",
        1,
        0,
      ); // 墨西哥1-0韩国
      insert.run(
        4,
        1,
        "Group A",
        "group",
        "completed",
        "2026-06-24T18:00:00Z",
        0,
        3,
      ); // 捷克0-3墨西哥
      insert.run(
        2,
        3,
        "Group A",
        "group",
        "completed",
        "2026-06-24T21:00:00Z",
        1,
        0,
      ); // 南非1-0韩国

      // B组小组赛（真实比分）
      insert.run(
        5,
        6,
        "Group B",
        "group",
        "completed",
        "2026-06-11T18:00:00Z",
        1,
        1,
      ); // 加拿大1-1波黑
      insert.run(
        7,
        8,
        "Group B",
        "group",
        "completed",
        "2026-06-11T21:00:00Z",
        1,
        1,
      ); // 卡塔尔1-1瑞士
      insert.run(
        8,
        6,
        "Group B",
        "group",
        "completed",
        "2026-06-18T18:00:00Z",
        4,
        1,
      ); // 瑞士4-1波黑
      insert.run(
        5,
        7,
        "Group B",
        "group",
        "completed",
        "2026-06-18T21:00:00Z",
        6,
        0,
      ); // 加拿大6-0卡塔尔
      insert.run(
        6,
        7,
        "Group B",
        "group",
        "completed",
        "2026-06-24T18:00:00Z",
        3,
        1,
      ); // 波黑3-1卡塔尔
      insert.run(
        8,
        5,
        "Group B",
        "group",
        "completed",
        "2026-06-24T21:00:00Z",
        2,
        1,
      ); // 瑞士2-1加拿大

      // C组小组赛（真实比分）
      insert.run(
        9,
        10,
        "Group C",
        "group",
        "completed",
        "2026-06-12T18:00:00Z",
        1,
        1,
      ); // 巴西1-1摩洛哥
      insert.run(
        11,
        12,
        "Group C",
        "group",
        "completed",
        "2026-06-12T21:00:00Z",
        0,
        1,
      ); // 海地0-1苏格兰
      insert.run(
        12,
        10,
        "Group C",
        "group",
        "completed",
        "2026-06-19T18:00:00Z",
        0,
        1,
      ); // 苏格兰0-1摩洛哥
      insert.run(
        9,
        11,
        "Group C",
        "group",
        "completed",
        "2026-06-19T21:00:00Z",
        3,
        0,
      ); // 巴西3-0海地
      insert.run(
        10,
        11,
        "Group C",
        "group",
        "completed",
        "2026-06-25T18:00:00Z",
        4,
        2,
      ); // 摩洛哥4-2海地
      insert.run(
        12,
        9,
        "Group C",
        "group",
        "completed",
        "2026-06-25T21:00:00Z",
        0,
        3,
      ); // 苏格兰0-3巴西

      // D组小组赛（真实比分）
      insert.run(
        13,
        14,
        "Group D",
        "group",
        "completed",
        "2026-06-12T18:00:00Z",
        4,
        1,
      ); // 美国4-1巴拉圭
      insert.run(
        15,
        16,
        "Group D",
        "group",
        "completed",
        "2026-06-12T21:00:00Z",
        2,
        0,
      ); // 澳大利亚2-0土耳其
      insert.run(
        13,
        15,
        "Group D",
        "group",
        "completed",
        "2026-06-19T18:00:00Z",
        2,
        0,
      ); // 美国2-0澳大利亚
      insert.run(
        16,
        14,
        "Group D",
        "group",
        "completed",
        "2026-06-19T21:00:00Z",
        0,
        1,
      ); // 土耳其0-1巴拉圭
      insert.run(
        14,
        15,
        "Group D",
        "group",
        "completed",
        "2026-06-25T18:00:00Z",
        0,
        0,
      ); // 巴拉圭0-0澳大利亚
      insert.run(
        16,
        13,
        "Group D",
        "group",
        "completed",
        "2026-06-25T21:00:00Z",
        3,
        2,
      ); // 土耳其3-2美国

      // E组小组赛（真实比分）
      insert.run(
        17,
        18,
        "Group E",
        "group",
        "completed",
        "2026-06-13T18:00:00Z",
        7,
        1,
      ); // 德国7-1库拉索
      insert.run(
        19,
        20,
        "Group E",
        "group",
        "completed",
        "2026-06-13T21:00:00Z",
        1,
        0,
      ); // 科特迪瓦1-0厄瓜多尔
      insert.run(
        17,
        19,
        "Group E",
        "group",
        "completed",
        "2026-06-20T18:00:00Z",
        2,
        1,
      ); // 德国2-1科特迪瓦
      insert.run(
        20,
        18,
        "Group E",
        "group",
        "completed",
        "2026-06-20T21:00:00Z",
        0,
        0,
      ); // 厄瓜多尔0-0库拉索
      insert.run(
        18,
        19,
        "Group E",
        "group",
        "completed",
        "2026-06-26T18:00:00Z",
        0,
        2,
      ); // 库拉索0-2科特迪瓦
      insert.run(
        20,
        17,
        "Group E",
        "group",
        "completed",
        "2026-06-26T21:00:00Z",
        2,
        1,
      ); // 厄瓜多尔2-1德国

      // F组小组赛（真实比分）
      insert.run(
        21,
        22,
        "Group F",
        "group",
        "completed",
        "2026-06-13T18:00:00Z",
        2,
        2,
      ); // 荷兰2-2日本
      insert.run(
        23,
        24,
        "Group F",
        "group",
        "completed",
        "2026-06-13T21:00:00Z",
        5,
        1,
      ); // 瑞典5-1突尼斯
      insert.run(
        21,
        23,
        "Group F",
        "group",
        "completed",
        "2026-06-20T18:00:00Z",
        5,
        1,
      ); // 荷兰5-1瑞典
      insert.run(
        24,
        22,
        "Group F",
        "group",
        "completed",
        "2026-06-20T21:00:00Z",
        0,
        4,
      ); // 突尼斯0-4日本
      insert.run(
        24,
        21,
        "Group F",
        "group",
        "completed",
        "2026-06-26T18:00:00Z",
        1,
        3,
      ); // 突尼斯1-3荷兰
      insert.run(
        22,
        23,
        "Group F",
        "group",
        "completed",
        "2026-06-26T21:00:00Z",
        1,
        1,
      ); // 日本1-1瑞典

      // G组小组赛（真实比分）
      insert.run(
        25,
        26,
        "Group G",
        "group",
        "completed",
        "2026-06-14T18:00:00Z",
        1,
        1,
      ); // 比利时1-1埃及
      insert.run(
        27,
        28,
        "Group G",
        "group",
        "completed",
        "2026-06-14T21:00:00Z",
        2,
        2,
      ); // 伊朗2-2新西兰
      insert.run(
        25,
        27,
        "Group G",
        "group",
        "completed",
        "2026-06-21T18:00:00Z",
        0,
        0,
      ); // 比利时0-0伊朗
      insert.run(
        28,
        26,
        "Group G",
        "group",
        "completed",
        "2026-06-21T21:00:00Z",
        1,
        3,
      ); // 新西兰1-3埃及
      insert.run(
        28,
        25,
        "Group G",
        "group",
        "completed",
        "2026-06-27T18:00:00Z",
        1,
        5,
      ); // 新西兰1-5比利时
      insert.run(
        26,
        27,
        "Group G",
        "group",
        "completed",
        "2026-06-27T21:00:00Z",
        1,
        1,
      ); // 埃及1-1伊朗

      // H组小组赛（真实比分）
      insert.run(
        29,
        30,
        "Group H",
        "group",
        "completed",
        "2026-06-14T18:00:00Z",
        0,
        0,
      ); // 西班牙0-0佛得角
      insert.run(
        31,
        32,
        "Group H",
        "group",
        "completed",
        "2026-06-14T21:00:00Z",
        1,
        1,
      ); // 沙特1-1乌拉圭
      insert.run(
        29,
        31,
        "Group H",
        "group",
        "completed",
        "2026-06-21T18:00:00Z",
        4,
        0,
      ); // 西班牙4-0沙特
      insert.run(
        32,
        30,
        "Group H",
        "group",
        "completed",
        "2026-06-21T21:00:00Z",
        2,
        2,
      ); // 乌拉圭2-2佛得角
      insert.run(
        30,
        31,
        "Group H",
        "group",
        "completed",
        "2026-06-27T18:00:00Z",
        0,
        0,
      ); // 佛得角0-0沙特
      insert.run(
        32,
        29,
        "Group H",
        "group",
        "completed",
        "2026-06-27T21:00:00Z",
        0,
        1,
      ); // 乌拉圭0-1西班牙

      // I组小组赛（真实比分）
      insert.run(
        33,
        34,
        "Group I",
        "group",
        "completed",
        "2026-06-15T18:00:00Z",
        3,
        1,
      ); // 法国3-1塞内加尔
      insert.run(
        35,
        36,
        "Group I",
        "group",
        "completed",
        "2026-06-15T21:00:00Z",
        1,
        4,
      ); // 伊拉克1-4挪威
      insert.run(
        33,
        35,
        "Group I",
        "group",
        "completed",
        "2026-06-22T18:00:00Z",
        3,
        0,
      ); // 法国3-0伊拉克
      insert.run(
        36,
        34,
        "Group I",
        "group",
        "completed",
        "2026-06-22T21:00:00Z",
        3,
        2,
      ); // 挪威3-2塞内加尔
      insert.run(
        34,
        35,
        "Group I",
        "group",
        "completed",
        "2026-06-28T18:00:00Z",
        5,
        0,
      ); // 塞内加尔5-0伊拉克
      insert.run(
        36,
        33,
        "Group I",
        "group",
        "completed",
        "2026-06-28T21:00:00Z",
        1,
        4,
      ); // 挪威1-4法国

      // J组小组赛（真实比分）
      insert.run(
        37,
        38,
        "Group J",
        "group",
        "completed",
        "2026-06-15T18:00:00Z",
        3,
        0,
      ); // 阿根廷3-0阿尔及利亚
      insert.run(
        39,
        40,
        "Group J",
        "group",
        "completed",
        "2026-06-15T21:00:00Z",
        3,
        1,
      ); // 奥地利3-1约旦
      insert.run(
        37,
        39,
        "Group J",
        "group",
        "completed",
        "2026-06-22T18:00:00Z",
        2,
        0,
      ); // 阿根廷2-0奥地利
      insert.run(
        40,
        38,
        "Group J",
        "group",
        "completed",
        "2026-06-22T21:00:00Z",
        1,
        2,
      ); // 约旦1-2阿尔及利亚
      insert.run(
        40,
        37,
        "Group J",
        "group",
        "completed",
        "2026-06-28T18:00:00Z",
        1,
        3,
      ); // 约旦1-3阿根廷
      insert.run(
        38,
        39,
        "Group J",
        "group",
        "completed",
        "2026-06-28T21:00:00Z",
        3,
        3,
      ); // 阿尔及利亚3-3奥地利

      // K组小组赛（真实比分）
      insert.run(
        41,
        42,
        "Group K",
        "group",
        "completed",
        "2026-06-16T18:00:00Z",
        1,
        1,
      ); // 葡萄牙1-1刚果(金)
      insert.run(
        43,
        44,
        "Group K",
        "group",
        "completed",
        "2026-06-16T21:00:00Z",
        1,
        3,
      ); // 乌兹别克1-3哥伦比亚
      insert.run(
        41,
        43,
        "Group K",
        "group",
        "completed",
        "2026-06-23T18:00:00Z",
        5,
        0,
      ); // 葡萄牙5-0乌兹别克
      insert.run(
        44,
        42,
        "Group K",
        "group",
        "completed",
        "2026-06-23T21:00:00Z",
        1,
        0,
      ); // 哥伦比亚1-0刚果(金)
      insert.run(
        42,
        43,
        "Group K",
        "group",
        "completed",
        "2026-06-29T18:00:00Z",
        3,
        1,
      ); // 刚果(金)3-1乌兹别克
      insert.run(
        44,
        41,
        "Group K",
        "group",
        "completed",
        "2026-06-29T21:00:00Z",
        0,
        0,
      ); // 哥伦比亚0-0葡萄牙

      // L组小组赛（真实比分）
      insert.run(
        45,
        46,
        "Group L",
        "group",
        "completed",
        "2026-06-16T18:00:00Z",
        4,
        2,
      ); // 英格兰4-2克罗地亚
      insert.run(
        47,
        48,
        "Group L",
        "group",
        "completed",
        "2026-06-16T21:00:00Z",
        1,
        0,
      ); // 加纳1-0巴拿马
      insert.run(
        45,
        47,
        "Group L",
        "group",
        "completed",
        "2026-06-23T18:00:00Z",
        0,
        0,
      ); // 英格兰0-0加纳
      insert.run(
        48,
        46,
        "Group L",
        "group",
        "completed",
        "2026-06-23T21:00:00Z",
        0,
        1,
      ); // 巴拿马0-1克罗地亚
      insert.run(
        46,
        47,
        "Group L",
        "group",
        "completed",
        "2026-06-29T18:00:00Z",
        2,
        1,
      ); // 克罗地亚2-1加纳
      insert.run(
        48,
        45,
        "Group L",
        "group",
        "completed",
        "2026-06-29T21:00:00Z",
        0,
        2,
      ); // 巴拿马0-2英格兰

      // 32强赛（真实比分，6月28日-7月3日）
      insert.run(
        1,
        20,
        "",
        "round_of_32",
        "completed",
        "2026-06-28T18:00:00Z",
        2,
        0,
      ); // 墨西哥2-0厄瓜多尔
      insert.run(
        45,
        42,
        "",
        "round_of_32",
        "completed",
        "2026-06-28T21:00:00Z",
        2,
        1,
      ); // 英格兰2-1刚果(金)
      insert.run(
        2,
        5,
        "",
        "round_of_32",
        "completed",
        "2026-06-29T18:00:00Z",
        0,
        1,
      ); // 南非0-1加拿大
      insert.run(
        8,
        38,
        "",
        "round_of_32",
        "completed",
        "2026-06-29T21:00:00Z",
        2,
        0,
      ); // 瑞士2-0阿尔及利亚
      insert.run(
        44,
        47,
        "",
        "round_of_32",
        "completed",
        "2026-06-29T23:00:00Z",
        1,
        0,
      ); // 哥伦比亚1-0加纳
      insert.run(
        9,
        22,
        "",
        "round_of_32",
        "completed",
        "2026-06-30T18:00:00Z",
        2,
        1,
      ); // 巴西2-1日本
      insert.run(
        17,
        14,
        "",
        "round_of_32",
        "completed",
        "2026-06-30T21:00:00Z",
        1,
        1,
      ); // 德国1-1巴拉圭(点球3-4)
      insert.run(
        21,
        10,
        "",
        "round_of_32",
        "completed",
        "2026-06-30T23:00:00Z",
        1,
        1,
      ); // 荷兰1-1摩洛哥(点球2-3)
      insert.run(
        33,
        23,
        "",
        "round_of_32",
        "completed",
        "2026-07-01T18:00:00Z",
        3,
        0,
      ); // 法国3-0瑞典
      insert.run(
        19,
        36,
        "",
        "round_of_32",
        "completed",
        "2026-07-01T21:00:00Z",
        1,
        2,
      ); // 科特迪瓦1-2挪威
      insert.run(
        25,
        34,
        "",
        "round_of_32",
        "completed",
        "2026-07-01T23:00:00Z",
        3,
        2,
      ); // 比利时3-2塞内加尔
      insert.run(
        13,
        6,
        "",
        "round_of_32",
        "completed",
        "2026-07-02T18:00:00Z",
        2,
        0,
      ); // 美国2-0波黑
      insert.run(
        41,
        46,
        "",
        "round_of_32",
        "completed",
        "2026-07-02T21:00:00Z",
        2,
        1,
      ); // 葡萄牙2-1克罗地亚
      insert.run(
        37,
        30,
        "",
        "round_of_32",
        "completed",
        "2026-07-02T23:00:00Z",
        3,
        2,
      ); // 阿根廷3-2佛得角
      insert.run(
        29,
        39,
        "",
        "round_of_32",
        "completed",
        "2026-07-03T18:00:00Z",
        3,
        0,
      ); // 西班牙3-0奥地利
      insert.run(
        15,
        26,
        "",
        "round_of_32",
        "completed",
        "2026-07-03T21:00:00Z",
        1,
        1,
      ); // 澳大利亚1-1埃及(点球2-4)

      // 1/8决赛（真实比分，7月4-7日）
      insert.run(
        14,
        33,
        "",
        "round_of_16",
        "completed",
        "2026-07-04T18:00:00Z",
        0,
        1,
      ); // 巴拉圭0-1法国
      insert.run(
        5,
        10,
        "",
        "round_of_16",
        "completed",
        "2026-07-04T21:00:00Z",
        0,
        3,
      ); // 加拿大0-3摩洛哥
      insert.run(
        41,
        29,
        "",
        "round_of_16",
        "completed",
        "2026-07-05T18:00:00Z",
        0,
        1,
      ); // 葡萄牙0-1西班牙
      insert.run(
        13,
        25,
        "",
        "round_of_16",
        "completed",
        "2026-07-05T21:00:00Z",
        1,
        4,
      ); // 美国1-4比利时
      insert.run(
        9,
        36,
        "",
        "round_of_16",
        "completed",
        "2026-07-06T18:00:00Z",
        1,
        2,
      ); // 巴西1-2挪威
      insert.run(
        1,
        45,
        "",
        "round_of_16",
        "completed",
        "2026-07-06T21:00:00Z",
        2,
        3,
      ); // 墨西哥2-3英格兰
      insert.run(
        37,
        26,
        "",
        "round_of_16",
        "completed",
        "2026-07-07T18:00:00Z",
        3,
        2,
      ); // 阿根廷3-2埃及
      insert.run(
        8,
        44,
        "",
        "round_of_16",
        "completed",
        "2026-07-07T21:00:00Z",
        0,
        0,
      ); // 瑞士0-0哥伦比亚(点球4-3)

      // 1/4决赛已完赛（真实比分，7月10-11日）
      insert.run(
        33,
        10,
        "",
        "quarter_final",
        "completed",
        "2026-07-10T18:00:00Z",
        2,
        0,
      ); // 法国2-0摩洛哥
      insert.run(
        29,
        25,
        "",
        "quarter_final",
        "completed",
        "2026-07-11T18:00:00Z",
        2,
        1,
      ); // 西班牙2-1比利时

      // 1/4决赛（7月12日）
      insert.run(
        36,
        45,
        "",
        "quarter_final",
        "completed",
        "2026-07-12T05:00:00Z",
        1,
        2,
      ); // 挪威1-2英格兰（加时赛，英格兰晋级）
      insert.run(
        37,
        8,
        "",
        "quarter_final",
        "completed",
        "2026-07-12T09:00:00Z",
        3,
        1,
      ); // 阿根廷3-1瑞士（梅西助攻麦卡利斯特进球）

      // 半决赛（7月15-16日，尚未进行）
      insert.run(
        33,
        29,
        "",
        "semi_final",
        "scheduled",
        "2026-07-15T03:00:00Z",
        null,
        null,
      ); // 法国vs西班牙
      insert.run(
        45,
        37,
        "",
        "semi_final",
        "scheduled",
        "2026-07-16T03:00:00Z",
        null,
        null,
      ); // 英格兰vs阿根廷
    }
  }

  private initializePlayers() {
    const row = this.database
      .prepare("SELECT COUNT(*) AS total FROM players")
      .get() as { total: number };

    if (row.total > 0) return;

    const insert = this.database.prepare(
      "INSERT INTO players (team_id, name, position, number, age, goals, assists, appearances, yellow_cards, red_cards) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );

    const players: Array<{
      teamId: number;
      name: string;
      position: string;
      number: number;
      age: number;
      goals?: number;
      assists?: number;
      appearances?: number;
      yellowCards?: number;
      redCards?: number;
    }> = [
      // 阿根廷 (teamId: 37)
      { teamId: 37, name: "Juan Musso", position: "GK", number: 1, age: 32 },
      { teamId: 37, name: "Leonardo Balerdi", position: "DF", number: 2, age: 27 },
      { teamId: 37, name: "Nicolas Tagliafico", position: "DF", number: 3, age: 33 },
      { teamId: 37, name: "Gonzalo Montiel", position: "DF", number: 4, age: 29 },
      { teamId: 37, name: "Leandro Paredes", position: "MF", number: 5, age: 32 },
      { teamId: 37, name: "Lisandro Martinez", position: "DF", number: 6, age: 28 },
      { teamId: 37, name: "Rodrigo De Paul", position: "MF", number: 7, age: 32 },
      { teamId: 37, name: "Valentin Barco", position: "MF", number: 8, age: 22 },
      { teamId: 37, name: "Julian Alvarez", position: "FW", number: 9, age: 26, goals: 4, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 37, name: "Lionel Messi", position: "FW", number: 10, age: 39, goals: 8, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 37, name: "Giovani Lo Celso", position: "MF", number: 11, age: 30 },
      { teamId: 37, name: "Geronimo Rulli", position: "GK", number: 12, age: 34 },
      { teamId: 37, name: "Cristian Romero", position: "DF", number: 13, age: 28 },
      { teamId: 37, name: "Exequiel Palacios", position: "MF", number: 14, age: 28 },
      { teamId: 37, name: "Nicolas Gonzalez", position: "FW", number: 15, age: 28 },
      { teamId: 37, name: "Thiago Almada", position: "FW", number: 16, age: 25 },
      { teamId: 37, name: "Giuliano Simeone", position: "FW", number: 17, age: 23 },
      { teamId: 37, name: "Nico Paz", position: "FW", number: 18, age: 22 },
      { teamId: 37, name: "Nicolas Otamendi", position: "DF", number: 19, age: 38 },
      { teamId: 37, name: "Alexis Mac Allister", position: "MF", number: 20, age: 27 },
      { teamId: 37, name: "Jose Manuel Lopez", position: "FW", number: 21, age: 26 },
      { teamId: 37, name: "Lautaro Martinez", position: "FW", number: 22, age: 28 },
      { teamId: 37, name: "Emiliano Martinez", position: "GK", number: 23, age: 33 },
      { teamId: 37, name: "Enzo Fernandez", position: "MF", number: 24, age: 25 },
      { teamId: 37, name: "Facundo Medina", position: "DF", number: 25, age: 27 },
      { teamId: 37, name: "Nahuel Molina", position: "DF", number: 26, age: 28 },

      // 奥地利 (teamId: 39)
      { teamId: 39, name: "Alexander Schlager", position: "GK", number: 1, age: 30 },
      { teamId: 39, name: "David Affengruber", position: "DF", number: 2, age: 24 },
      { teamId: 39, name: "Kevin Danso", position: "DF", number: 3, age: 27 },
      { teamId: 39, name: "Xaver Schlager", position: "MF", number: 4, age: 28 },
      { teamId: 39, name: "Stefan Posch", position: "DF", number: 6, age: 29 },
      { teamId: 39, name: "Marko Arnautovic", position: "FW", number: 7, age: 37 },
      { teamId: 39, name: "David Alaba", position: "DF", number: 8, age: 34 },
      { teamId: 39, name: "Marcel Sabitzer", position: "MF", number: 9, age: 32 },
      { teamId: 39, name: "Florian Grillitsch", position: "MF", number: 10, age: 31 },
      { teamId: 39, name: "Michael Gregoritsch", position: "FW", number: 11, age: 32 },
      { teamId: 39, name: "Florian Wastler", position: "GK", number: 12, age: 28 },
      { teamId: 39, name: "Patrick Pentz", position: "GK", number: 13, age: 29 },
      { teamId: 39, name: "Philipp Lienhart", position: "DF", number: 15, age: 29 },
      { teamId: 39, name: "Philipp Mwene", position: "DF", number: 16, age: 31 },
      { teamId: 39, name: "Louis Schaub", position: "MF", number: 17, age: 31 },
      { teamId: 39, name: "Romano Schmid", position: "MF", number: 18, age: 24 },
      { teamId: 39, name: "Dejan Ljubicic", position: "MF", number: 19, age: 28 },
      { teamId: 39, name: "Sasa Kalajdzic", position: "FW", number: 14, age: 28 },
      { teamId: 39, name: "Konrad Laimer", position: "MF", number: 20, age: 29 },
      { teamId: 39, name: "Patrick Wimmer", position: "MF", number: 21, age: 24 },
      { teamId: 39, name: "Alexander Prass", position: "DF", number: 22, age: 24 },
      { teamId: 39, name: "Marco Friedl", position: "DF", number: 23, age: 26 },
      { teamId: 39, name: "Paul Wanner", position: "MF", number: 24, age: 20 },
      { teamId: 39, name: "Michael Svoboda", position: "DF", number: 25, age: 26 },
      { teamId: 39, name: "Alessandro Schopf", position: "MF", number: 26, age: 32 },
      { teamId: 39, name: "Nicolas Seiwald", position: "MF", number: 5, age: 23 },

      // 阿尔及利亚 (teamId: 38)
      { teamId: 38, name: "Moustapha Zeghba", position: "GK", number: 1, age: 34 },
      { teamId: 38, name: "Aissa Mandi", position: "DF", number: 2, age: 33 },
      { teamId: 38, name: "Abderrahmane Abada", position: "DF", number: 3, age: 23 },
      { teamId: 38, name: "Tugay Gorbulenko", position: "DF", number: 4, age: 25 },
      { teamId: 38, name: "Belkacem Belkacem", position: "DF", number: 5, age: 24 },
      { teamId: 38, name: "Zerrouki", position: "MF", number: 6, age: 26 },
      { teamId: 38, name: "Riyad Mahrez", position: "FW", number: 7, age: 35 },
      { teamId: 38, name: "Houssem Aouar", position: "MF", number: 8, age: 28 },
      { teamId: 38, name: "Amine Gouiri", position: "FW", number: 9, age: 26 },
      { teamId: 38, name: "Ibrahim Maza", position: "MF", number: 22, age: 23 },
      { teamId: 38, name: "Farid Boulaya", position: "MF", number: 10, age: 32 },
      { teamId: 38, name: "Anis Ben Slimane", position: "MF", number: 11, age: 25 },
      { teamId: 38, name: "Ramy Bensebaini", position: "DF", number: 21, age: 30 },
      { teamId: 38, name: "Abderrahmane Hachoud", position: "DF", number: 13, age: 22 },
      { teamId: 38, name: "Nabil Bentaleb", position: "MF", number: 19, age: 31 },
      { teamId: 38, name: "Abdellah Amoura", position: "FW", number: 18, age: 24 },
      { teamId: 38, name: "Badredine Bouanani", position: "FW", number: 20, age: 21 },
      { teamId: 38, name: "Luca Zidane", position: "GK", number: 23, age: 27 },
      { teamId: 38, name: "Yacine Titraoui", position: "MF", number: 24, age: 22 },
      { teamId: 38, name: "Zineddine Belaid", position: "DF", number: 15, age: 22 },
      { teamId: 38, name: "Moncef Bakrar", position: "FW", number: 25, age: 24 },
      { teamId: 38, name: "Hichem Boudaoui", position: "MF", number: 14, age: 25 },
      { teamId: 38, name: "Youcef Benlamri", position: "DF", number: 16, age: 23 },
      { teamId: 38, name: "Teddy Bouda", position: "FW", number: 12, age: 26 },
      { teamId: 38, name: "Mehdi Zerkane", position: "MF", number: 17, age: 26 },
      { teamId: 38, name: "Chaouki Benhaddouche", position: "DF", number: 26, age: 24 },

      // 约旦 (teamId: 40)
      { teamId: 40, name: "Yazeed Abulaila", position: "GK", number: 1, age: 32 },
      { teamId: 40, name: "Mohammad Abu Hasheesh", position: "DF", number: 2, age: 28 },
      { teamId: 40, name: "Abdallah Nasib", position: "DF", number: 3, age: 28 },
      { teamId: 40, name: "Hossam Abu Dahab", position: "DF", number: 4, age: 26 },
      { teamId: 40, name: "Yazan Al-Arab", position: "DF", number: 5, age: 29 },
      { teamId: 40, name: "Amir Jamaeen", position: "MF", number: 6, age: 27 },
      { teamId: 40, name: "Mohammad Abu Zrayq", position: "FW", number: 7, age: 26 },
      { teamId: 40, name: "Noor Al-Rawabdeh", position: "MF", number: 8, age: 27 },
      { teamId: 40, name: "Ali Olwan", position: "FW", number: 9, age: 24 },
      { teamId: 40, name: "Musa Al-Taamari", position: "FW", number: 10, age: 28 },
      { teamId: 40, name: "Odai Fakhoury", position: "FW", number: 11, age: 27 },
      { teamId: 40, name: "Nourdin Zaid", position: "GK", number: 12, age: 30 },
      { teamId: 40, name: "Mahmoud Al-Mardi", position: "FW", number: 13, age: 30 },
      { teamId: 40, name: "Rajaei Ayed", position: "MF", number: 14, age: 28 },
      { teamId: 40, name: "Ibrahim Sadeh", position: "MF", number: 15, age: 23 },
      { teamId: 40, name: "Mohammad Aburabia", position: "DF", number: 16, age: 24 },
      { teamId: 40, name: "Salem Al-Obaid", position: "DF", number: 17, age: 28 },
      { teamId: 40, name: "Ibrahim Sabra", position: "FW", number: 18, age: 22 },
      { teamId: 40, name: "Saeed Al-Rosan", position: "FW", number: 19, age: 26 },
      { teamId: 40, name: "Mohammad Abu Taha", position: "MF", number: 20, age: 23 },
      { teamId: 40, name: "Nizar Al-Rashdan", position: "MF", number: 21, age: 25 },
      { teamId: 40, name: "Abdullah Al-Fakhouri", position: "GK", number: 22, age: 25 },
      { teamId: 40, name: "Ehsan Haddad", position: "DF", number: 23, age: 32 },
      { teamId: 40, name: "Ali Al-Azaizeh", position: "FW", number: 24, age: 22 },
      { teamId: 40, name: "Mohammad Dawud", position: "MF", number: 25, age: 26 },
      { teamId: 40, name: "Anas Bani Yaseen", position: "DF", number: 26, age: 35 },

      // 西班牙 (teamId: 29)
      { teamId: 29, name: "David Raya", position: "GK", number: 1, age: 30 },
      { teamId: 29, name: "Marc Povel", position: "DF", number: 2, age: 26 },
      { teamId: 29, name: "Alex Grimaldo", position: "DF", number: 3, age: 30 },
      { teamId: 29, name: "Eric Garcia", position: "DF", number: 4, age: 25 },
      { teamId: 29, name: "Marcos Llorente", position: "DF", number: 5, age: 31 },
      { teamId: 29, name: "Mikel Merino", position: "MF", number: 6, age: 29 },
      { teamId: 29, name: "Ferran Torres", position: "FW", number: 7, age: 26 },
      { teamId: 29, name: "Fabian Ruiz", position: "MF", number: 8, age: 30 },
      { teamId: 29, name: "Gavi", position: "MF", number: 9, age: 21 },
      { teamId: 29, name: "Dani Olmo", position: "FW", number: 10, age: 28 },
      { teamId: 29, name: "Jeremy Pino", position: "FW", number: 11, age: 23 },
      { teamId: 29, name: "Pedro Porro", position: "DF", number: 12, age: 26 },
      { teamId: 29, name: "Joan Garcia", position: "GK", number: 13, age: 24 },
      { teamId: 29, name: "Aymeric Laporte", position: "DF", number: 14, age: 32 },
      { teamId: 29, name: "Alex Baena", position: "MF", number: 15, age: 24 },
      { teamId: 29, name: "Rodri", position: "MF", number: 16, age: 29 },
      { teamId: 29, name: "Nico Williams", position: "FW", number: 17, age: 23 },
      { teamId: 29, name: "Martin Zubimendi", position: "MF", number: 18, age: 27 },
      { teamId: 29, name: "Lamine Yamal", position: "FW", number: 19, age: 18 },
      { teamId: 29, name: "Pedri", position: "MF", number: 20, age: 23 },
      { teamId: 29, name: "Mikel Oyarzabal", position: "FW", number: 21, age: 29, goals: 4, assists: 1, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 29, name: "Pau Cubarsi", position: "DF", number: 22, age: 19 },
      { teamId: 29, name: "Unai Simon", position: "GK", number: 23, age: 29 },
      { teamId: 29, name: "Marc Cucurella", position: "DF", number: 24, age: 27 },
      { teamId: 29, name: "Victor Munoz", position: "FW", number: 25, age: 22 },
      { teamId: 29, name: "Borja Iglesias", position: "FW", number: 26, age: 33 },

      // 比利时 (teamId: 25)
      { teamId: 25, name: "Thibaut Courtois", position: "GK", number: 1, age: 34 },
      { teamId: 25, name: "Zeno Debast", position: "DF", number: 2, age: 22 },
      { teamId: 25, name: "Arthur Theate", position: "DF", number: 3, age: 25 },
      { teamId: 25, name: "Brandon Mechele", position: "DF", number: 4, age: 33 },
      { teamId: 25, name: "Jan De Cuyper", position: "DF", number: 5, age: 26 },
      { teamId: 25, name: "Axel Witsel", position: "MF", number: 6, age: 37 },
      { teamId: 25, name: "Kevin De Bruyne", position: "MF", number: 7, age: 35 },
      { teamId: 25, name: "Youri Tielemans", position: "MF", number: 8, age: 29 },
      { teamId: 25, name: "Romelu Lukaku", position: "FW", number: 9, age: 33, goals: 3, assists: 0, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 25, name: "Leandro Trossard", position: "FW", number: 10, age: 31 },
      { teamId: 25, name: "Jeremy Doku", position: "FW", number: 11, age: 24 },
      { teamId: 25, name: "Senne Lammens", position: "GK", number: 12, age: 23 },
      { teamId: 25, name: "Mike Penders", position: "GK", number: 13, age: 24 },
      { teamId: 25, name: "Dodi Lukebakio", position: "FW", number: 14, age: 28 },
      { teamId: 25, name: "Thomas Meunier", position: "DF", number: 15, age: 34 },
      { teamId: 25, name: "Koni De Winter", position: "DF", number: 16, age: 24 },
      { teamId: 25, name: "Charles De Ketelaere", position: "MF", number: 17, age: 25 },
      { teamId: 25, name: "Joaquin Seys", position: "DF", number: 18, age: 23 },
      { teamId: 25, name: "Diego Moreira", position: "FW", number: 19, age: 22 },
      { teamId: 25, name: "Hans Vanaken", position: "MF", number: 20, age: 33 },
      { teamId: 25, name: "Timothy Castagne", position: "DF", number: 21, age: 30 },
      { teamId: 25, name: "Maxime De Cuyper", position: "MF", number: 22, age: 25 },
      { teamId: 25, name: "Nicolas Raskin", position: "MF", number: 23, age: 25 },
      { teamId: 25, name: "Amadou Onana", position: "MF", number: 24, age: 25 },
      { teamId: 25, name: "Nathan Nuytinck", position: "DF", number: 25, age: 24 },
      { teamId: 25, name: "Mathias Pardo", position: "FW", number: 26, age: 22 },

      // 英格兰 (teamId: 45)
      { teamId: 45, name: "Jordan Pickford", position: "GK", number: 1, age: 32 },
      { teamId: 45, name: "Ezri Konsa", position: "DF", number: 2, age: 28 },
      { teamId: 45, name: "Nico O'Reilly", position: "DF", number: 3, age: 20 },
      { teamId: 45, name: "Declan Rice", position: "MF", number: 4, age: 27 },
      { teamId: 45, name: "John Stones", position: "DF", number: 5, age: 32 },
      { teamId: 45, name: "Marc Guehi", position: "DF", number: 6, age: 26 },
      { teamId: 45, name: "Bukayo Saka", position: "FW", number: 7, age: 24, goals: 5, assists: 3, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 45, name: "Elliot Anderson", position: "MF", number: 8, age: 23 },
      { teamId: 45, name: "Harry Kane", position: "FW", number: 9, age: 33, goals: 6, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 45, name: "Jude Bellingham", position: "MF", number: 10, age: 23, goals: 6, assists: 3, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 45, name: "Marcus Rashford", position: "FW", number: 11, age: 28, goals: 2, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 45, name: "Tino Livramento", position: "DF", number: 12, age: 23 },
      { teamId: 45, name: "Dean Henderson", position: "GK", number: 13, age: 29 },
      { teamId: 45, name: "Jordan Henderson", position: "MF", number: 14, age: 36 },
      { teamId: 45, name: "Dan Burn", position: "DF", number: 15, age: 34 },
      { teamId: 45, name: "Kobbie Mainoo", position: "MF", number: 16, age: 20 },
      { teamId: 45, name: "Morgan Rogers", position: "MF", number: 17, age: 23 },
      { teamId: 45, name: "Anthony Gordon", position: "FW", number: 18, age: 25 },
      { teamId: 45, name: "Ollie Watkins", position: "FW", number: 19, age: 30 },
      { teamId: 45, name: "Noni Madueke", position: "FW", number: 20, age: 24 },
      { teamId: 45, name: "Eberechi Eze", position: "MF", number: 21, age: 28 },
      { teamId: 45, name: "Ivan Toney", position: "FW", number: 22, age: 30 },
      { teamId: 45, name: "James Trafford", position: "GK", number: 23, age: 23 },
      { teamId: 45, name: "Reece James", position: "DF", number: 24, age: 26 },
      { teamId: 45, name: "Djed Spence", position: "DF", number: 25, age: 25 },
      { teamId: 45, name: "Jarell Quansah", position: "DF", number: 26, age: 23 },

      // 德国 (teamId: 17)
      { teamId: 17, name: "Manuel Neuer", position: "GK", number: 1, age: 40 },
      { teamId: 17, name: "Antonio Rudiger", position: "DF", number: 2, age: 33 },
      { teamId: 17, name: "David Raum", position: "DF", number: 3, age: 28 },
      { teamId: 17, name: "Matthias Ginter", position: "DF", number: 4, age: 32 },
      { teamId: 17, name: "Jonathan Tah", position: "DF", number: 5, age: 30 },
      { teamId: 17, name: "Joshua Kimmich", position: "MF", number: 6, age: 31 },
      { teamId: 17, name: "Kai Havertz", position: "FW", number: 7, age: 27, goals: 3, assists: 0, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 17, name: "Leon Goretzka", position: "MF", number: 8, age: 31 },
      { teamId: 17, name: "Niclas Fullkrug", position: "FW", number: 9, age: 33 },
      { teamId: 17, name: "Jamal Musiala", position: "MF", number: 10, age: 23 },
      { teamId: 17, name: "Mario Gotze", position: "MF", number: 11, age: 34 },
      { teamId: 17, name: "Kevin Trapp", position: "GK", number: 12, age: 36 },
      { teamId: 17, name: "Thomas Muller", position: "FW", number: 13, age: 36 },
      { teamId: 17, name: "Emre Can", position: "MF", number: 14, age: 32 },
      { teamId: 17, name: "Nico Schlotterbeck", position: "DF", number: 15, age: 26 },
      { teamId: 17, name: "Benjamin Henrichs", position: "DF", number: 16, age: 29 },
      { teamId: 17, name: "Florian Wirtz", position: "MF", number: 17, age: 23 },
      { teamId: 17, name: "Jonas Hofmann", position: "FW", number: 18, age: 33 },
      { teamId: 17, name: "Leroy Sane", position: "FW", number: 19, age: 30 },
      { teamId: 17, name: "Serge Gnabry", position: "FW", number: 20, age: 31 },
      { teamId: 17, name: "Ilkay Gundogan", position: "MF", number: 21, age: 35 },
      { teamId: 17, name: "Marc-Andre ter Stegen", position: "GK", number: 22, age: 34 },
      { teamId: 17, name: "Robert Andrich", position: "MF", number: 23, age: 31 },
      { teamId: 17, name: "Marius Wolf", position: "DF", number: 24, age: 30 },
      { teamId: 17, name: "Karim Adeyemi", position: "FW", number: 25, age: 24 },
      { teamId: 17, name: "Lukas Nmecha", position: "FW", number: 26, age: 27 },

      // 葡萄牙 (teamId: 41)
      { teamId: 41, name: "Diogo Costa", position: "GK", number: 1, age: 27 },
      { teamId: 41, name: "Nelson Semedo", position: "DF", number: 2, age: 32 },
      { teamId: 41, name: "Ruben Dias", position: "DF", number: 3, age: 29 },
      { teamId: 41, name: "Toto Araujo", position: "DF", number: 4, age: 24 },
      { teamId: 41, name: "Diogo Dalot", position: "DF", number: 5, age: 27 },
      { teamId: 41, name: "Matheus Nunes", position: "MF", number: 6, age: 27 },
      { teamId: 41, name: "Cristiano Ronaldo", position: "FW", number: 7, age: 41, goals: 3, assists: 0, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 41, name: "Bruno Fernandes", position: "MF", number: 8, age: 31 },
      { teamId: 41, name: "Goncalo Ramos", position: "FW", number: 9, age: 25 },
      { teamId: 41, name: "Bernardo Silva", position: "MF", number: 10, age: 31 },
      { teamId: 41, name: "Joao Felix", position: "FW", number: 11, age: 26 },
      { teamId: 41, name: "Jose Sa", position: "GK", number: 12, age: 32 },
      { teamId: 41, name: "Renato Veiga", position: "DF", number: 13, age: 22 },
      { teamId: 41, name: "Goncalo Inacio", position: "DF", number: 14, age: 25 },
      { teamId: 41, name: "Joao Neves", position: "MF", number: 15, age: 22 },
      { teamId: 41, name: "Francisco Trincao", position: "FW", number: 16, age: 26 },
      { teamId: 41, name: "Rafael Leao", position: "FW", number: 17, age: 27 },
      { teamId: 41, name: "Pedro Neto", position: "FW", number: 18, age: 25 },
      { teamId: 41, name: "Goncalo Guedes", position: "FW", number: 19, age: 29 },
      { teamId: 41, name: "Joao Cancelo", position: "DF", number: 20, age: 32 },
      { teamId: 41, name: "Ruben Neves", position: "MF", number: 21, age: 29 },
      { teamId: 41, name: "Rui Silva", position: "GK", number: 22, age: 31 },
      { teamId: 41, name: "Vitinha", position: "MF", number: 23, age: 26 },
      { teamId: 41, name: "Sam Costa", position: "DF", number: 24, age: 24 },
      { teamId: 41, name: "Nuno Mendes", position: "DF", number: 25, age: 24 },
      { teamId: 41, name: "Francisco Conceicao", position: "FW", number: 26, age: 23 },

      // 法国 (teamId: 33)
      { teamId: 33, name: "Mike Maignan", position: "GK", number: 1, age: 30 },
      { teamId: 33, name: "Benjamin Pavard", position: "DF", number: 2, age: 29 },
      { teamId: 33, name: "Axel Disasi", position: "DF", number: 3, age: 27 },
      { teamId: 33, name: "Dayot Upamecano", position: "DF", number: 4, age: 26 },
      { teamId: 33, name: "Jules Kounde", position: "DF", number: 5, age: 26 },
      { teamId: 33, name: "Aurelien Tchouameni", position: "MF", number: 6, age: 25 },
      { teamId: 33, name: "Ousmane Dembele", position: "FW", number: 7, age: 27, goals: 5, assists: 3, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 33, name: "Antoine Griezmann", position: "FW", number: 8, age: 34, goals: 4, assists: 3, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 33, name: "Marcus Thuram", position: "FW", number: 9, age: 27 },
      { teamId: 33, name: "Kylian Mbappe", position: "FW", number: 10, age: 25, goals: 8, assists: 3, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 33, name: "Randal Kolo Muani", position: "FW", number: 11, age: 27 },
      { teamId: 33, name: "Brice Samba", position: "GK", number: 12, age: 31 },
      { teamId: 33, name: "Matteo Guendouzi", position: "MF", number: 13, age: 26 },
      { teamId: 33, name: "Adrien Rabiot", position: "MF", number: 14, age: 29 },
      { teamId: 33, name: "Eduardo Camavinga", position: "MF", number: 15, age: 22 },
      { teamId: 33, name: "Malo Gusto", position: "DF", number: 16, age: 23 },
      { teamId: 33, name: "William Saliba", position: "DF", number: 17, age: 24 },
      { teamId: 33, name: "Olivier Giroud", position: "FW", number: 18, age: 38 },
      { teamId: 33, name: "Kingsley Coman", position: "FW", number: 19, age: 28 },
      { teamId: 33, name: "Johan Martial", position: "MF", number: 20, age: 27 },
      { teamId: 33, name: "Lenny Yoro", position: "DF", number: 21, age: 19 },
      { teamId: 33, name: "Luis Hernandez", position: "DF", number: 22, age: 29 },
      { teamId: 33, name: "Alphonse Areola", position: "GK", number: 23, age: 31 },
      { teamId: 33, name: "Warren Zaire-Emery", position: "MF", number: 24, age: 18 },
      { teamId: 33, name: "Theo Hernandez", position: "DF", number: 25, age: 27 },
      { teamId: 33, name: "Mathis Tel", position: "FW", number: 26, age: 19 },

      // 巴西 (teamId: 9)
      { teamId: 9, name: "Bento", position: "GK", number: 1, age: 26 },
      { teamId: 9, name: "Danilo", position: "DF", number: 2, age: 34 },
      { teamId: 9, name: "Eder Militao", position: "DF", number: 3, age: 28 },
      { teamId: 9, name: "Marquinhos", position: "DF", number: 4, age: 32 },
      { teamId: 9, name: "Ibanez", position: "DF", number: 5, age: 27 },
      { teamId: 9, name: "Bruno Guimaraes", position: "MF", number: 6, age: 28 },
      { teamId: 9, name: "Raphinha", position: "FW", number: 7, age: 29, goals: 5, assists: 3, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 9, name: "Endrick", position: "FW", number: 8, age: 20 },
      { teamId: 9, name: "Richarlison", position: "FW", number: 9, age: 29 },
      { teamId: 9, name: "Vinicius Junior", position: "FW", number: 10, age: 26, goals: 4, assists: 4, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 9, name: "Gustavo Cunha", position: "FW", number: 11, age: 25, goals: 4, assists: 2, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 9, name: "Gabriel Magalhaes", position: "DF", number: 12, age: 28 },
      { teamId: 9, name: "Wendell", position: "DF", number: 13, age: 32 },
      { teamId: 9, name: "Gabriel Martinelli", position: "FW", number: 14, age: 25, goals: 3, assists: 2, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 9, name: "Andreas Pereira", position: "MF", number: 15, age: 30 },
      { teamId: 9, name: "Joelinton", position: "MF", number: 16, age: 29 },
      { teamId: 9, name: "Rodrygo", position: "FW", number: 17, age: 25, goals: 2, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 9, name: "Joao Gomes", position: "MF", number: 18, age: 25 },
      { teamId: 9, name: "Gabriel Jesus", position: "FW", number: 19, age: 29, goals: 2, assists: 1, appearances: 3, yellowCards: 0, redCards: 0 },
      { teamId: 9, name: "Savinho", position: "FW", number: 20, age: 22 },
      { teamId: 9, name: "Lucas Beraldo", position: "DF", number: 21, age: 22 },
      { teamId: 9, name: "Luiz Henrique", position: "MF", number: 22, age: 25 },
      { teamId: 9, name: "Rafael", position: "GK", number: 23, age: 35 },
      { teamId: 9, name: "Goncalo", position: "MF", number: 24, age: 23 },
      { teamId: 9, name: "Caio Henrique", position: "DF", number: 25, age: 28 },
      { teamId: 9, name: "Pablo Maia", position: "MF", number: 26, age: 23 },

      // 挪威 (teamId: 36)
      { teamId: 36, name: "Orjan Nyland", position: "GK", number: 1, age: 35 },
      { teamId: 36, name: "Kristoffer Ajer", position: "DF", number: 2, age: 28 },
      { teamId: 36, name: "Lars Lukas Mai", position: "DF", number: 3, age: 26 },
      { teamId: 36, name: "Stefan Strandberg", position: "DF", number: 4, age: 35 },
      { teamId: 36, name: "Birger Meling", position: "DF", number: 5, age: 31 },
      { teamId: 36, name: "Patrick Berg", position: "MF", number: 6, age: 28 },
      { teamId: 36, name: "Martin Odegaard", position: "MF", number: 7, age: 27, goals: 3, assists: 4, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 36, name: "Erling Haaland", position: "FW", number: 9, age: 25, goals: 7, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 36, name: "Mohamed Elyounoussi", position: "MF", number: 8, age: 31 },
      { teamId: 36, name: "Oscar Bobb", position: "MF", number: 10, age: 23, goals: 2, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 36, name: "Jens Petter Hauge", position: "FW", number: 11, age: 26 },
      { teamId: 36, name: "Mathias Dyngeland", position: "GK", number: 12, age: 29 },
      { teamId: 36, name: "Leo Ostigard", position: "DF", number: 13, age: 26 },
      { teamId: 36, name: "Antonio Nusa", position: "FW", number: 14, age: 21, goals: 1, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 36, name: "Sander Berge", position: "MF", number: 15, age: 28 },
      { teamId: 36, name: "Hugo Vetlesen", position: "MF", number: 16, age: 26 },
      { teamId: 36, name: "Bryan Fiabema", position: "FW", number: 17, age: 23 },
      { teamId: 36, name: "Kristian Thorstvedt", position: "MF", number: 18, age: 26 },
      { teamId: 36, name: "Eskil Edh", position: "DF", number: 19, age: 22 },
      { teamId: 36, name: "Aron Donsa", position: "MF", number: 20, age: 24 },
      { teamId: 36, name: "David Moller Wolfe", position: "DF", number: 21, age: 23 },
      { teamId: 36, name: "Emil Konradsen Ceide", position: "FW", number: 22, age: 24 },
      { teamId: 36, name: "Karl-Johan Johnsson", position: "GK", number: 23, age: 36 },
      { teamId: 36, name: "Jorgen Strand Larsen", position: "FW", number: 24, age: 25 },
      { teamId: 36, name: "Sebastian Sebulonsen", position: "DF", number: 25, age: 25 },
      { teamId: 36, name: "Isak Hansen-Aaroen", position: "MF", number: 26, age: 21 },

      // 墨西哥 (teamId: 1)
      { teamId: 1, name: "Guillermo Ochoa", position: "GK", number: 1, age: 40 },
      { teamId: 1, name: "Julian Araujo", position: "DF", number: 2, age: 24 },
      { teamId: 1, name: "Cesar Montes", position: "DF", number: 3, age: 29 },
      { teamId: 1, name: "Edson Alvarez", position: "MF", number: 4, age: 28 },
      { teamId: 1, name: "Johan Vasquez", position: "DF", number: 5, age: 27 },
      { teamId: 1, name: "Luis Chavez", position: "MF", number: 6, age: 30 },
      { teamId: 1, name: "Raul Jimenez", position: "FW", number: 9, age: 35, goals: 3, assists: 1, appearances: 3, yellowCards: 0, redCards: 0 },
      { teamId: 1, name: "Hirving Lozano", position: "FW", number: 10, age: 30, goals: 2, assists: 2, appearances: 3, yellowCards: 0, redCards: 0 },
      { teamId: 1, name: "Santiago Gimenez", position: "FW", number: 11, age: 25, goals: 3, assists: 1, appearances: 3, yellowCards: 0, redCards: 0 },
      { teamId: 1, name: "Luis Quinones", position: "MF", number: 17, age: 31, goals: 4, assists: 2, appearances: 3, yellowCards: 0, redCards: 0 },
      { teamId: 1, name: "Uriel Antuna", position: "FW", number: 7, age: 28, goals: 2, assists: 1, appearances: 3, yellowCards: 0, redCards: 0 },

      // 西班牙 (teamId: 29)
      { teamId: 29, name: "Unai Simon", position: "GK", number: 1, age: 29 },
      { teamId: 29, name: "Dani Carvajal", position: "DF", number: 2, age: 34 },
      { teamId: 29, name: "Robin Le Normand", position: "DF", number: 3, age: 29 },
      { teamId: 29, name: "Aymeric Laporte", position: "DF", number: 4, age: 32 },
      { teamId: 29, name: "Daniel Vivian", position: "DF", number: 5, age: 27 },
      { teamId: 29, name: "Mikel Merino", position: "MF", number: 6, age: 30, goals: 2, assists: 1, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 29, name: "Alvaro Morata", position: "FW", number: 7, age: 33, goals: 3, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 29, name: "Fabian Ruiz", position: "MF", number: 8, age: 30 },
      { teamId: 29, name: "Gavi", position: "MF", number: 9, age: 21 },
      { teamId: 29, name: "Dani Olmo", position: "MF", number: 10, age: 28, goals: 2, assists: 3, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 29, name: "Ferran Torres", position: "FW", number: 11, age: 26, goals: 3, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 29, name: "Alex Remiro", position: "GK", number: 12, age: 30 },
      { teamId: 29, name: "Mikel Oyarzabal", position: "FW", number: 13, age: 29, goals: 4, assists: 1, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 29, name: "Rodri", position: "MF", number: 14, age: 29, goals: 2, assists: 1, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 29, name: "Lamine Yamal", position: "FW", number: 17, age: 18, goals: 3, assists: 3, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 29, name: "Pedri", position: "MF", number: 18, age: 23 },
      { teamId: 29, name: "Nacho", position: "DF", number: 19, age: 36 },
      { teamId: 29, name: "Marlos Moreno", position: "DF", number: 20, age: 28 },
      { teamId: 29, name: "Nicolas Williams", position: "FW", number: 21, age: 24, goals: 2, assists: 2, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 29, name: "Marc Cucurella", position: "DF", number: 22, age: 27 },
      { teamId: 29, name: "Dani Vizcaya", position: "GK", number: 23, age: 26 },
      { teamId: 29, name: "Alex Baena", position: "MF", number: 24, age: 24 },
      { teamId: 29, name: "Alejandro Grimaldo", position: "DF", number: 25, age: 30 },
      { teamId: 29, name: "Fermin Lopez", position: "MF", number: 26, age: 23 },

      // 荷兰 (teamId: 21)
      { teamId: 21, name: "Bart Verbruggen", position: "GK", number: 1, age: 23 },
      { teamId: 21, name: "Jeremie Frimpong", position: "DF", number: 2, age: 25 },
      { teamId: 21, name: "Nathan Ake", position: "DF", number: 3, age: 31 },
      { teamId: 21, name: "Virgil van Dijk", position: "DF", number: 4, age: 34 },
      { teamId: 21, name: "Micky van de Ven", position: "DF", number: 5, age: 25 },
      { teamId: 21, name: "Frenkie de Jong", position: "MF", number: 6, age: 29 },
      { teamId: 21, name: "Xavi Simons", position: "MF", number: 7, age: 23, goals: 3, assists: 2, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 21, name: "Cody Gakpo", position: "FW", number: 8, age: 27, goals: 3, assists: 2, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 21, name: "Brian Brobbey", position: "FW", number: 9, age: 24, goals: 3, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 21, name: "Memphis Depay", position: "FW", number: 10, age: 32, goals: 2, assists: 3, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 21, name: "Donyell Malen", position: "FW", number: 11, age: 27, goals: 2, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 21, name: "Justin Bijlow", position: "GK", number: 12, age: 28 },
      { teamId: 21, name: "Quilindschy Hartman", position: "DF", number: 13, age: 24 },
      { teamId: 21, name: "Ryan Gravenberch", position: "MF", number: 14, age: 24 },
      { teamId: 21, name: "Mats Wieffer", position: "MF", number: 15, age: 26 },
      { teamId: 21, name: "Joey Veerman", position: "MF", number: 16, age: 27 },
      { teamId: 21, name: "Ryan Reijnders", position: "MF", number: 17, age: 27 },
      { teamId: 21, name: "Daley Blind", position: "DF", number: 18, age: 36 },
      { teamId: 21, name: "Wout Weghorst", position: "FW", number: 19, age: 33 },
      { teamId: 21, name: "Teun Koopmeiners", position: "MF", number: 20, age: 28, goals: 2, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 21, name: "Denzel Dumfries", position: "DF", number: 22, age: 30 },
      { teamId: 21, name: "Mark Flekken", position: "GK", number: 23, age: 32 },
      { teamId: 21, name: "Joshua Zirkzee", position: "FW", number: 24, age: 25 },
      { teamId: 21, name: "Jorrel Hato", position: "DF", number: 25, age: 19 },
      { teamId: 21, name: "Kenneth Taylor", position: "MF", number: 26, age: 24 },

      // 比利时 (teamId: 25)
      { teamId: 25, name: "Thibaut Courtois", position: "GK", number: 1, age: 34 },
      { teamId: 25, name: "Ameen Al-Dakhil", position: "DF", number: 2, age: 24 },
      { teamId: 25, name: "Arthur Theate", position: "DF", number: 3, age: 25 },
      { teamId: 25, name: "Zeno Debast", position: "DF", number: 4, age: 22 },
      { teamId: 25, name: "Jan Vertonghen", position: "DF", number: 5, age: 39 },
      { teamId: 25, name: "Axel Witsel", position: "MF", number: 6, age: 37 },
      { teamId: 25, name: "Kevin De Bruyne", position: "MF", number: 7, age: 35, goals: 2, assists: 4, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 25, name: "Youri Tielemans", position: "MF", number: 8, age: 29 },
      { teamId: 25, name: "Romelu Lukaku", position: "FW", number: 9, age: 33, goals: 3, assists: 1, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 25, name: "Eden Hazard", position: "FW", number: 10, age: 35 },
      { teamId: 25, name: "Jeremy Doku", position: "FW", number: 11, age: 24, goals: 2, assists: 3, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 25, name: "Koen Casteels", position: "GK", number: 12, age: 33 },
      { teamId: 25, name: "Thomas Meunier", position: "DF", number: 13, age: 34 },
      { teamId: 25, name: "Charles De Ketelaere", position: "FW", number: 14, age: 25, goals: 2, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 25, name: "Thomas Vermaelen", position: "DF", number: 15, age: 40 },
      { teamId: 25, name: "Leandro Trossard", position: "FW", number: 16, age: 31, goals: 2, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 25, name: "Hans Vanaken", position: "MF", number: 17, age: 33 },
      { teamId: 25, name: "Amadou Onana", position: "MF", number: 18, age: 24 },
      { teamId: 25, name: "Thorgan Hazard", position: "MF", number: 19, age: 33 },
      { teamId: 25, name: "Timothy Castagne", position: "DF", number: 20, age: 30 },
      { teamId: 25, name: "Thierry Small", position: "DF", number: 21, age: 21 },
      { teamId: 25, name: "Dodi Lukebakio", position: "FW", number: 22, age: 28 },
      { teamId: 25, name: "Thomas Kaminski", position: "GK", number: 23, age: 32 },
      { teamId: 25, name: "Lois Openda", position: "FW", number: 24, age: 26 },
      { teamId: 25, name: "Arthur Vermeeren", position: "MF", number: 25, age: 21 },
      { teamId: 25, name: "Mats Rits", position: "MF", number: 26, age: 32 },

      // 瑞士 (teamId: 8)
      { teamId: 8, name: "Yann Sommer", position: "GK", number: 1, age: 37 },
      { teamId: 8, name: "Kevin Mbabu", position: "DF", number: 2, age: 31 },
      { teamId: 8, name: "Ricardo Rodriguez", position: "DF", number: 3, age: 33 },
      { teamId: 8, name: "Nico Elvedi", position: "DF", number: 4, age: 29 },
      { teamId: 8, name: "Manuel Akanji", position: "DF", number: 5, age: 30 },
      { teamId: 8, name: "Granit Xhaka", position: "MF", number: 6, age: 33 },
      { teamId: 8, name: "Xherdan Shaqiri", position: "MF", number: 7, age: 34 },
      { teamId: 8, name: "Remo Freuler", position: "MF", number: 8, age: 34 },
      { teamId: 8, name: "Haris Seferovic", position: "FW", number: 9, age: 34 },
      { teamId: 8, name: "Manzambi", position: "FW", number: 10, age: 26, goals: 3, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 8, name: "Breel Embolo", position: "FW", number: 11, age: 29, goals: 2, assists: 1, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 8, name: "Gregor Kobel", position: "GK", number: 12, age: 28 },
      { teamId: 8, name: "Ruben Vargas", position: "MF", number: 13, age: 27, goals: 2, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 8, name: "Michael Lang", position: "DF", number: 14, age: 34 },
      { teamId: 8, name: "Djibril Sow", position: "MF", number: 15, age: 30 },
      { teamId: 8, name: "Fabian Schar", position: "DF", number: 16, age: 34 },
      { teamId: 8, name: "Denis Zakaria", position: "MF", number: 17, age: 29 },
      { teamId: 8, name: "Simon Adingra", position: "FW", number: 18, age: 24 },
      { teamId: 8, name: "Eray Comert", position: "DF", number: 19, age: 28 },
      { teamId: 8, name: "Fabian Rieder", position: "MF", number: 20, age: 24 },
      { teamId: 8, name: "Silvan Widmer", position: "DF", number: 21, age: 32 },
      { teamId: 8, name: "Fabian Lustenberger", position: "DF", number: 22, age: 38 },
      { teamId: 8, name: "Yvon Mvogo", position: "GK", number: 23, age: 31 },
      { teamId: 8, name: "Zeki Amdouni", position: "FW", number: 24, age: 25, goals: 1, assists: 1, appearances: 3, yellowCards: 0, redCards: 0 },
      { teamId: 8, name: "Cedric Itten", position: "FW", number: 25, age: 29 },
      { teamId: 8, name: "Ardon Jashari", position: "MF", number: 26, age: 23 },

      // 摩洛哥 (teamId: 10)
      { teamId: 10, name: "Yassine Bounou", position: "GK", number: 1, age: 35 },
      { teamId: 10, name: "Achraf Hakimi", position: "DF", number: 2, age: 27, goals: 2, assists: 3, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 10, name: "Noussair Mazraoui", position: "DF", number: 3, age: 28 },
      { teamId: 10, name: "Romain Saiss", position: "DF", number: 4, age: 36 },
      { teamId: 10, name: "Nayef Aguerd", position: "DF", number: 5, age: 30 },
      { teamId: 10, name: "Sofyan Amrabat", position: "MF", number: 6, age: 29 },
      { teamId: 10, name: "Hakim Ziyech", position: "MF", number: 7, age: 33, goals: 1, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 10, name: "Azzedine Ounahi", position: "MF", number: 8, age: 26 },
      { teamId: 10, name: "Sofiane Boufal", position: "FW", number: 9, age: 32 },
      { teamId: 10, name: "Sebaïti", position: "MF", number: 10, age: 27, goals: 3, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 10, name: "Ismael Saibari", position: "MF", number: 11, age: 24, goals: 2, assists: 1, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 10, name: "Munir El Kajoui", position: "GK", number: 12, age: 35 },
      { teamId: 10, name: "Youssef En-Nesyri", position: "FW", number: 13, age: 29, goals: 2, assists: 1, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 10, name: "Zakaria Aboukhlal", position: "FW", number: 14, age: 26 },
      { teamId: 10, name: "Selim Amallah", position: "MF", number: 15, age: 29 },
      { teamId: 10, name: "Aymen Barkok", position: "MF", number: 16, age: 28 },
      { teamId: 10, name: "Sofiane Diop", position: "MF", number: 17, age: 25 },
      { teamId: 10, name: "Abdelhamid Sabiri", position: "MF", number: 18, age: 29 },
      { teamId: 10, name: "Youssef Maziz", position: "MF", number: 19, age: 26 },
      { teamId: 10, name: "Ahmed El Messaoudi", position: "DF", number: 20, age: 30 },
      { teamId: 10, name: "Mohamed Chibi", position: "DF", number: 21, age: 31 },
      { teamId: 10, name: "Amine Harit", position: "MF", number: 22, age: 29 },
      { teamId: 10, name: "Mehdi Benabid", position: "GK", number: 23, age: 26 },
      { teamId: 10, name: "Amine Adli", position: "FW", number: 24, age: 26 },
      { teamId: 10, name: "Oussama El Azzouzi", position: "DF", number: 25, age: 24 },
      { teamId: 10, name: "Bilal El Khannous", position: "MF", number: 26, age: 22 },

      // 塞内加尔 (teamId: 34)
      { teamId: 34, name: "Edouard Mendy", position: "GK", number: 1, age: 34 },
      { teamId: 34, name: "Kalidou Koulibaly", position: "DF", number: 3, age: 34 },
      { teamId: 34, name: "Sadio Mane", position: "FW", number: 10, age: 34, goals: 3, assists: 3, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 34, name: "Ismaila Sarr", position: "FW", number: 18, age: 28, goals: 4, assists: 2, appearances: 4, yellowCards: 0, redCards: 0 },

      // 美国 (teamId: 13)
      { teamId: 13, name: "Matt Turner", position: "GK", number: 1, age: 32 },
      { teamId: 13, name: "Sergino Dest", position: "DF", number: 2, age: 25 },
      { teamId: 13, name: "Chris Richards", position: "DF", number: 3, age: 26 },
      { teamId: 13, name: "Tyler Adams", position: "MF", number: 4, age: 27 },
      { teamId: 13, name: "Antonee Robinson", position: "DF", number: 5, age: 28 },
      { teamId: 13, name: "Yunus Musah", position: "MF", number: 6, age: 23 },
      { teamId: 13, name: "Giovanni Reyna", position: "MF", number: 7, age: 23, goals: 2, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 13, name: "Weston McKennie", position: "MF", number: 8, age: 27 },
      { teamId: 13, name: "Folarin Balogun", position: "FW", number: 9, age: 24, goals: 3, assists: 1, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 13, name: "Christian Pulisic", position: "FW", number: 10, age: 27, goals: 2, assists: 3, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 13, name: "Brenden Aaronson", position: "MF", number: 11, age: 25 },
      { teamId: 13, name: "Tim Weah", position: "FW", number: 17, age: 26, goals: 1, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 13, name: "Ricardo Pepi", position: "FW", number: 19, age: 23, goals: 2, assists: 0, appearances: 3, yellowCards: 0, redCards: 0 },

      // 加拿大 (teamId: 5)
      { teamId: 5, name: "Milan Borjan", position: "GK", number: 1, age: 38 },
      { teamId: 5, name: "Alistair Johnston", position: "DF", number: 2, age: 27 },
      { teamId: 5, name: "Sam Adekugbe", position: "DF", number: 3, age: 30 },
      { teamId: 5, name: "Kamal Miller", position: "DF", number: 4, age: 28 },
      { teamId: 5, name: "Stephen Eustaquio", position: "MF", number: 7, age: 29 },
      { teamId: 5, name: "Jonathan David", position: "FW", number: 9, age: 26, goals: 3, assists: 1, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 5, name: "Tajon Buchanan", position: "FW", number: 11, age: 27, goals: 2, assists: 1, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 5, name: "Alphonso Davies", position: "FW", number: 19, age: 25, goals: 2, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 5, name: "Cyle Larin", position: "FW", number: 20, age: 31, goals: 1, assists: 0, appearances: 3, yellowCards: 0, redCards: 0 },

      // 刚果(金) (teamId: 42)
      { teamId: 42, name: "Lionel Mpasi", position: "GK", number: 1, age: 30 },
      { teamId: 42, name: "Aldo Kalulu", position: "DF", number: 2, age: 28 },
      { teamId: 42, name: "Aaron Tshibola", position: "MF", number: 6, age: 31 },
      { teamId: 42, name: "Youssouf Mulumbu", position: "MF", number: 8, age: 39 },
      { teamId: 42, name: "Cedric Bakambu", position: "FW", number: 9, age: 34 },
      { teamId: 42, name: "Yoane Wissa", position: "FW", number: 11, age: 29, goals: 3, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 42, name: "Samuel Moutoussamy", position: "MF", number: 13, age: 28 },
      { teamId: 42, name: "Silas Katompa Mvumpa", position: "FW", number: 14, age: 26, goals: 2, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 42, name: "Beni Mukendi", position: "MF", number: 15, age: 23 },
      { teamId: 42, name: "Gedeon Kalulu", position: "DF", number: 18, age: 26 },

      // 哥伦比亚 (teamId: 44)
      { teamId: 44, name: "David Ospina", position: "GK", number: 1, age: 37 },
      { teamId: 44, name: "Stefan Medina", position: "DF", number: 2, age: 33 },
      { teamId: 44, name: "Oscar Murillo", position: "DF", number: 3, age: 37 },
      { teamId: 44, name: "Juan Cuadrado", position: "MF", number: 4, age: 38 },
      { teamId: 44, name: "Wilmar Barrios", position: "MF", number: 5, age: 32 },
      { teamId: 44, name: "James Rodriguez", position: "MF", number: 10, age: 35, goals: 2, assists: 3, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 44, name: "Luis Diaz", position: "FW", number: 7, age: 29, goals: 3, assists: 2, appearances: 5, yellowCards: 0, redCards: 0 },
      { teamId: 44, name: "Radamel Falcao", position: "FW", number: 9, age: 40 },
      { teamId: 44, name: "Miguel Borja", position: "FW", number: 11, age: 33 },
      { teamId: 44, name: "Mateus Uribe", position: "MF", number: 15, age: 35 },
      { teamId: 44, name: "Davinson Sanchez", position: "DF", number: 13, age: 30 },
      { teamId: 44, name: "Yerry Mina", position: "DF", number: 23, age: 32 },
      { teamId: 44, name: "Luis Sinisterra", position: "FW", number: 16, age: 27, goals: 2, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 44, name: "Rafael Santos Borré", position: "FW", number: 19, age: 30, goals: 2, assists: 0, appearances: 3, yellowCards: 0, redCards: 0 },

      // 日本 (teamId: 22)
      { teamId: 22, name: "Daiya Maekawa", position: "GK", number: 1, age: 30 },
      { teamId: 22, name: "Yukinari Sugawara", position: "DF", number: 2, age: 25 },
      { teamId: 22, name: "Shogo Taniguchi", position: "DF", number: 3, age: 34 },
      { teamId: 22, name: "Ko Itakura", position: "DF", number: 4, age: 29 },
      { teamId: 22, name: "Hidemasa Morita", position: "MF", number: 5, age: 30 },
      { teamId: 22, name: "Wataru Endo", position: "MF", number: 6, age: 33 },
      { teamId: 22, name: "Kaoru Mitoma", position: "FW", number: 7, age: 29, goals: 3, assists: 2, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 22, name: "Takumi Minamino", position: "MF", number: 8, age: 31 },
      { teamId: 22, name: "Ayase Ueda", position: "FW", number: 9, age: 27, goals: 2, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 22, name: "Ritsu Doan", position: "FW", number: 10, age: 28, goals: 1, assists: 2, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 22, name: "Junya Ito", position: "FW", number: 11, age: 33 },
      { teamId: 22, name: "Mao Hosoya", position: "FW", number: 13, age: 24, goals: 2, assists: 0, appearances: 3, yellowCards: 0, redCards: 0 },
      { teamId: 22, name: "Keito Nakamura", position: "FW", number: 14, age: 25 },
      { teamId: 22, name: "Takefusa Kubo", position: "MF", number: 15, age: 25 },
      { teamId: 22, name: "Yuki Soma", position: "MF", number: 17, age: 28 },
      { teamId: 22, name: "Ao Tanaka", position: "MF", number: 18, age: 27 },
      { teamId: 22, name: "Maya Yoshida", position: "DF", number: 22, age: 37 },
      { teamId: 22, name: "Daniel Schmidt", position: "GK", number: 23, age: 34 },

      // 乌拉圭 (teamId: 32)
      { teamId: 32, name: "Sergio Rochet", position: "GK", number: 1, age: 32 },
      { teamId: 32, name: "Jose Maria Gimenez", position: "DF", number: 2, age: 31 },
      { teamId: 32, name: "Diego Godin", position: "DF", number: 3, age: 40 },
      { teamId: 32, name: "Ronald Araujo", position: "DF", number: 4, age: 27 },
      { teamId: 32, name: "Federico Valverde", position: "MF", number: 5, age: 28, goals: 2, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 32, name: "Rodrigo Bentancur", position: "MF", number: 6, age: 28 },
      { teamId: 32, name: "Nicolas de la Cruz", position: "MF", number: 7, age: 28 },
      { teamId: 32, name: "Nahitan Nandez", position: "MF", number: 8, age: 30 },
      { teamId: 32, name: "Luis Suarez", position: "FW", number: 9, age: 39 },
      { teamId: 32, name: "Edinson Cavani", position: "FW", number: 10, age: 39 },
      { teamId: 32, name: "Darwin Nunez", position: "FW", number: 11, age: 27, goals: 3, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 32, name: "Manuel Ugarte", position: "MF", number: 15, age: 25 },
      { teamId: 32, name: "Mathias Olivera", position: "DF", number: 16, age: 27 },
      { teamId: 32, name: "Matias Vina", position: "DF", number: 17, age: 27 },
      { teamId: 32, name: "Facundo Pellistri", position: "FW", number: 18, age: 24 },
      { teamId: 32, name: "Sebastian Coates", position: "DF", number: 19, age: 35 },
      { teamId: 32, name: "Jonathan Rodriguez", position: "FW", number: 20, age: 32 },
      { teamId: 32, name: "Martin Caceres", position: "DF", number: 22, age: 39 },
      { teamId: 32, name: "Fernando Muslera", position: "GK", number: 23, age: 39 },
      { teamId: 32, name: "Agustin Canobbio", position: "FW", number: 24, age: 27, goals: 1, assists: 1, appearances: 3, yellowCards: 0, redCards: 0 },

      // 克罗地亚 (teamId: 46)
      { teamId: 46, name: "Dominik Livakovic", position: "GK", number: 1, age: 31 },
      { teamId: 46, name: "Josip Juranovic", position: "DF", number: 2, age: 30 },
      { teamId: 46, name: "Borna Barisic", position: "DF", number: 3, age: 33 },
      { teamId: 46, name: "Josko Gvardiol", position: "DF", number: 5, age: 24 },
      { teamId: 46, name: "Marcelo Brozovic", position: "MF", number: 7, age: 33 },
      { teamId: 46, name: "Mateo Kovacic", position: "MF", number: 8, age: 32 },
      { teamId: 46, name: "Andrej Kramaric", position: "FW", number: 9, age: 34, goals: 2, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 46, name: "Luka Modric", position: "MF", number: 10, age: 40, goals: 1, assists: 2, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 46, name: "Marcelo Brozovic", position: "MF", number: 11, age: 33 },
      { teamId: 46, name: "Ivan Perisic", position: "FW", number: 14, age: 37, goals: 1, assists: 1, appearances: 4, yellowCards: 0, redCards: 0 },
      { teamId: 46, name: "Mario Pasalic", position: "MF", number: 15, age: 31 },
      { teamId: 46, name: "Bruno Petkovic", position: "FW", number: 17, age: 31, goals: 2, assists: 0, appearances: 3, yellowCards: 0, redCards: 0 },
      { teamId: 46, name: "Mislav Orsic", position: "MF", number: 18, age: 33 },
      { teamId: 46, name: "Martin Baturina", position: "MF", number: 20, age: 22 },
      { teamId: 46, name: "Dominik Kotarski", position: "GK", number: 23, age: 25 },
      { teamId: 46, name: "Duje Caleta-Car", position: "DF", number: 24, age: 29 },
    ];

    for (const p of players) {
      insert.run(p.teamId, p.name, p.position, p.number, p.age, p.goals ?? 0, p.assists ?? 0, p.appearances ?? 0, p.yellowCards ?? 0, p.redCards ?? 0);
    }
  }

  getDatabase(): DatabaseSync {
    return this.database;
  }

  @Destroy()
  async close() {
    this.database?.close();
  }
}
