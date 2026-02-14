
export interface Kr36Item {
  /**
   * 项目唯一ID
   */
  itemId: number;
  /**
   * 项目类型
   */
  itemType: number;
  /**
   * 发布时间戳 (ms)
   */
  publishTime: number;
  /**
   * 模板素材详情
   */
  templateMaterial: Kr36TemplateMaterial;
}

export interface Kr36TemplateMaterial {
  /**
   * 作者名称
   */
  authorName: string;
  /**
   * 项目ID
   */
  itemId: number;
  /**
   * 发布时间戳
   */
  publishTime: number;
  /**
   * 收藏数
   */
  statCollect: number;
  /**
   * 评论数
   */
  statComment: number;
  /**
   * 格式化后的统计描述 (如 "173点赞")
   */
  statFormat: string;
  /**
   * 点赞数
   */
  statPraise: number;
  /**
   * 阅读量
   */
  statRead: number;
  /**
   * 模板类型
   */
  templateType: number;
  /**
   * 封面图 URL
   */
  widgetImage: string;
  /**
   * 标题内容
   */
  widgetTitle: string;
}
