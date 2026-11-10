import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppColors, AppFonts, AppStageColors, AppTokens, AppTypography } from "@/src/theme/tokens";
import { ProjectComment } from "../../domain/entities/ProjectComment";
import { ShowcaseSizes } from "./showcaseSizes";

type Props = {
  comment: ProjectComment;
  replies: ProjectComment[];
  canReply: boolean;
  onReplyPress: () => void;
};

// Un comentario raiz con sus respuestas debajo, corridas y con una raya de
// tinta a la izquierda: `comment_thread_view.dart`.
export function CommentThreadView({ comment, replies, canReply, onReplyPress }: Props) {
  return (
    <View style={styles.thread} testID={CommentThreadView.keyFor(comment.id)}>
      <CommentBody item={comment} showReply={canReply} onReplyPress={onReplyPress} />
      {replies.length > 0 ? (
        <View style={styles.replies}>
          {replies.map((reply, index) => (
            <View key={reply.id ?? `respuesta-${index}`} style={styles.reply}>
              <CommentBody item={reply} showReply={false} />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

CommentThreadView.keyFor = (commentId: string | null) => `CommentThread_${commentId ?? ""}`;
CommentThreadView.replyKeyFor = (commentId: string | null) => `ButtonReply_${commentId ?? ""}`;

function CommentBody({ item, showReply, onReplyPress }: { item: ProjectComment; showReply: boolean; onReplyPress?: () => void }) {
  return (
    <View>
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: avatarColorOf(item.authorName) }]}>
          <Text style={styles.avatarText}>{initialsOf(item.authorName)}</Text>
        </View>
        <View style={styles.author}>
          <Text style={styles.authorName}>{item.authorName}</Text>
          {item.isTeam ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>EQUIPO DEL PROYECTO</Text>
            </View>
          ) : null}
        </View>
        {showReply ? (
          <Pressable
            testID={CommentThreadView.replyKeyFor(item.id)}
            accessibilityRole="button"
            onPress={onReplyPress}
            hitSlop={AppTokens.gapXs}
            style={styles.replyButton}
          >
            <Text style={styles.replyLabel}>Responder</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );
}

// Las dos primeras iniciales del nombre, o "?".
export function initialsOf(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
  return letters.length > 0 ? letters : "?";
}

const AVATAR_COLORS = [AppStageColors.testing, AppColors.petrol, AppColors.persimmon, AppStageColors.research, AppColors.ink];

// Un color fijo por nombre entre los cinco de Flutter. Flutter usa el
// `hashCode` del texto, que no es el mismo fuera de Dart: aqui va el hash de
// texto de siempre (h * 31 + letra), y el mismo nombre sale del mismo color.
function avatarColorOf(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const styles = StyleSheet.create({
  thread: { marginBottom: AppTokens.gapL },
  replies: { marginTop: AppTokens.gapM },
  reply: {
    marginLeft: AppTokens.gapL,
    marginBottom: AppTokens.gapM,
    paddingLeft: AppTokens.gapM,
    borderLeftWidth: ShowcaseSizes.replyRuleWidth,
    borderLeftColor: AppColors.ink,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: AppTokens.gapS },
  avatar: {
    width: ShowcaseSizes.avatarSize,
    height: ShowcaseSizes.avatarSize,
    borderRadius: ShowcaseSizes.avatarSize / 2,
    borderWidth: ShowcaseSizes.avatarBorder,
    borderColor: AppColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...AppTypography.bodySmall, fontFamily: AppFonts.bodyBold, color: AppColors.white },
  author: { flex: 1, alignItems: "flex-start" },
  authorName: { ...AppTypography.bodyMedium, fontFamily: AppFonts.bodyBold },
  badge: {
    marginTop: ShowcaseSizes.hairGap,
    paddingHorizontal: ShowcaseSizes.teamBadgePaddingH,
    paddingVertical: ShowcaseSizes.teamBadgePaddingV,
    backgroundColor: AppColors.ink,
    borderRadius: AppTokens.radius,
  },
  badgeText: {
    fontFamily: AppFonts.bodyBold,
    fontSize: ShowcaseSizes.teamBadgeFontSize,
    letterSpacing: ShowcaseSizes.teamBadgeLetterSpacing,
    color: AppColors.white,
  },
  replyButton: { paddingHorizontal: AppTokens.gapS },
  replyLabel: { ...AppTypography.bodySmall, fontFamily: AppFonts.bodySemiBold, color: AppColors.persimmon },
  text: { ...AppTypography.bodyMedium, marginTop: AppTokens.gapS },
});
