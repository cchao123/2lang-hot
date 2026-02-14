/**
 * Bilibili 视频条目基础接口
 */
export interface BilibiliVideoItem {
  aid: number;              // 稿件 avid
  bvid: string;             // 稿件 bvid
  cid: number;              // 视频 cid
  videos: number;           // 视频数量
  tid: number;              // 分区 id
  tname: string;            // 子分区名
  tidv2: number;            // 分区 id v2
  tnamev2: string;          // 子分区名 v2
  pid_v2: number;           // 父分区 id
  pid_name_v2: string;      // 父分区名
  copyright: number;        // 版权标志 (1自制, 2转载)
  pic: string;              // 封面图 URL
  title: string;            // 视频标题
  pubdate: number;          // 发布时间戳
  ctime: number;            // 创建时间戳
  desc: string;             // 视频简介
  state: number;            // 视频状态
  duration: number;         // 视频时长 (秒)
  dynamic: string;          // 动态文字内容
  short_link_v2: string;    // 短链接
  first_frame: string;      // 视频第一帧预览图
  pub_location?: string;    // 发布地点 (可能不存在)
  cover43: string;          // 4:3 比例封面图
  score: number;            // 综合评分/分数
  enable_vt: number;        // 是否启用播放量显示
  rights: VideoRights;      // 视频权限设置
  owner: VideoOwner;        // 视频Up主信息
  stat: VideoStat;          // 视频统计数据
  dimension: VideoDimension; // 视频分辨率信息
}

/**
 * 视频权限设置
 */
interface VideoRights {
  bp: number;
  elec: number;
  download: number;
  movie: number;
  pay: number;
  hd5: number;
  no_reprint: number;
  autoplay: number;
  ugc_pay: number;
  is_cooperation: number;
  ugc_pay_preview: number;
  no_background: number;
  arc_pay: number;
  pay_free_watch: number;
}

interface VideoOwner {
  mid: number;
  name: string;
  face: string;
}

/**
 * 视频统计数据
 */
interface VideoStat {
  aid: number;
  view: number;             // 播放量
  danmaku: number;          // 弹幕数
  reply: number;            // 评论数
  favorite: number;         // 收藏数
  coin: number;             // 硬币数
  share: number;            // 分享数
  now_rank: number;         // 当前排名
  his_rank: number;         // 历史最高排名
  like: number;             // 点赞数
  dislike: number;          // 踩 (通常为0)
  vt: number;
  vv: number;
  fav_g: number;
  like_g: number;
}

/**
 * 视频分辨率/尺寸
 */
interface VideoDimension {
  width: number;
  height: number;
  rotate: number;           // 是否旋转 (0: 横屏, 1: 竖屏)
}