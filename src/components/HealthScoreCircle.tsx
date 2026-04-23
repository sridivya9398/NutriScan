import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import { COLORS, FONT_SIZE, FONT_WEIGHT, getScoreColor, getScoreLabel, getLetterGrade } from '../constants/theme';

interface HealthScoreCircleProps {
    score: number;
    size?: 'small' | 'medium' | 'large';
    showLabel?: boolean;
    showGrade?: boolean;
    animated?: boolean;
}

export const HealthScoreCircle: React.FC<HealthScoreCircleProps> = ({
    score,
    size = 'large',
    showLabel = true,
    showGrade = true,
    animated = true,
}) => {
    const animatedValue = React.useRef(new Animated.Value(0)).current;
    const [displayScore, setDisplayScore] = React.useState(0);

    const dimensions = {
        small: { size: 60, strokeWidth: 4, fontSize: FONT_SIZE.lg },
        medium: { size: 100, strokeWidth: 6, fontSize: FONT_SIZE.xxl },
        large: { size: 160, strokeWidth: 8, fontSize: FONT_SIZE.display },
    };

    const config = dimensions[size];
    const radius = (config.size - config.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const scoreColor = getScoreColor(score);

    React.useEffect(() => {
        if (animated) {
            animatedValue.setValue(0);
            Animated.timing(animatedValue, {
                toValue: score,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }).start();

            animatedValue.addListener(({ value }) => {
                setDisplayScore(Math.round(value));
            });

            return () => animatedValue.removeAllListeners();
        } else {
            setDisplayScore(score);
        }
    }, [score, animated]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    return (
        <View style={styles.container}>
            <View style={[styles.circleContainer, { width: config.size, height: config.size }]}>
                {/* Background circle */}
                <View
                    style={[
                        styles.backgroundCircle,
                        {
                            width: config.size,
                            height: config.size,
                            borderRadius: config.size / 2,
                            borderWidth: config.strokeWidth,
                        },
                    ]}
                />

                {/* Progress circle (simplified - using border) */}
                <View
                    style={[
                        styles.progressCircle,
                        {
                            width: config.size,
                            height: config.size,
                            borderRadius: config.size / 2,
                            borderWidth: config.strokeWidth,
                            borderColor: scoreColor,
                            transform: [{ rotate: '-90deg' }],
                        },
                    ]}
                />

                {/* Glow effect */}
                <View
                    style={[
                        styles.glowCircle,
                        {
                            width: config.size + 20,
                            height: config.size + 20,
                            borderRadius: (config.size + 20) / 2,
                            backgroundColor: scoreColor,
                            opacity: 0.15,
                        },
                    ]}
                />

                {/* Score text */}
                <View style={styles.scoreContainer}>
                    <Text style={[styles.scoreText, { fontSize: config.fontSize, color: scoreColor }]}>
                        {displayScore}
                    </Text>
                    {size === 'large' && (
                        <Text style={styles.maxScore}>/100</Text>
                    )}
                </View>
            </View>

            {showLabel && size !== 'small' && (
                <Text style={[styles.label, { color: scoreColor }]}>
                    {getScoreLabel(score)}
                </Text>
            )}

            {showGrade && (
                <View style={[styles.gradeBadge, { backgroundColor: scoreColor }]}>
                    <Text style={styles.gradeText}>{getLetterGrade(score)}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    circleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundCircle: {
        position: 'absolute',
        borderColor: COLORS.bgCardLight,
    },
    progressCircle: {
        position: 'absolute',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    glowCircle: {
        position: 'absolute',
        zIndex: -1,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    scoreText: {
        fontWeight: FONT_WEIGHT.bold,
    },
    maxScore: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.textMuted,
        fontWeight: FONT_WEIGHT.medium,
        marginLeft: 2,
    },
    label: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.semibold,
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    gradeBadge: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    gradeText: {
        color: COLORS.bgPrimary,
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
    },
});

export default HealthScoreCircle;
