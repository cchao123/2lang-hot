import { httpGet } from '../shared/http';
import {
  BAIDU_HOT_API,
  BILIBILI_HOT_API,
  WEIBO_HOT_API,
  KR36_HOT_API,
  TOUTIAO_HOT_API,
  WEIXIN_HOT_API
} from '../shared/constant';
import { RankingResponse } from '../types/typed';
import { BilibiliVideoItem } from '../types/bilibili';

export const getBaiduHot = async () => {
  return await httpGet<RankingResponse<any>>(BAIDU_HOT_API, {
    headers: {
      Referer: 'https://top.baidu.com/'
    }
  });
};

export const getBilibiliHot = async () => {
  return await httpGet<RankingResponse<BilibiliVideoItem>>(BILIBILI_HOT_API);
};

export const getWeiboHot = async () => {
  return await httpGet<RankingResponse<any>>(WEIBO_HOT_API);
};

export const getToutiao = async () => {
  return await httpGet<RankingResponse<any>>(TOUTIAO_HOT_API);
};

export const get36krHot = async () => {
  return await httpGet<RankingResponse<any>>(KR36_HOT_API);
};

export const getVxBook = async () => {
  return await httpGet<RankingResponse<any>>(WEIXIN_HOT_API);
};
