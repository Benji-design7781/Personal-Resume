export type SceneCardId = "business" | "multi" | "delivery";

export type SceneCardRecord = {
  id: SceneCardId;
  indexLabel: string;
  title: string;
  keywords: string[];
  description: string;
  shortDescription: string;
};

export const sceneCardIds: SceneCardId[] = ["business", "multi", "delivery"];

export const sceneCardData: Record<SceneCardId, SceneCardRecord> = {
  business: {
    id: "business",
    indexLabel: "01",
    title: "复杂业务拆解",
    keywords: ["规则梳理", "状态流设计", "异常边界补全"],
    description:
      "面对规则交错、状态增多的业务场景，我会先抽出主链路，再把分支、例外和逆向流程逐层补齐，让复杂逻辑变成可以协作和落地的产品结构。",
    shortDescription:
      "复杂并不意味着堆叠更多描述，而意味着要先建立秩序，再让方案具备执行价值。",
  },
  multi: {
    id: "multi",
    indexLabel: "02",
    title: "多端协同梳理",
    keywords: ["职责关系", "入口边界", "协同路径"],
    description:
      "面对多角色、多入口、多端状态不一致的问题，我会先重新拆清角色边界，再梳理不同端之间的信息流、操作流和责任关系，让协同路径重新变得清楚。",
    shortDescription:
      "多端不是简单复制功能，而是让不同角色在正确的位置完成正确的动作。",
  },
  delivery: {
    id: "delivery",
    indexLabel: "03",
    title: "产品落地推进",
    keywords: ["方案理解", "实现推进", "验收迭代"],
    description:
      "从需求进入实现阶段后，我会持续关注方案是否被正确理解、关键状态是否被完整覆盖、上线结果是否符合预期，并在反馈中继续推动迭代。",
    shortDescription:
      "产品价值不是停在方案里，而是在实现、验收和迭代中被真正兑现。",
  },
};
