import { computed, ref, type Ref } from 'vue';

export type HeroSequencePhase = 'idle' | 'thinking' | 'typing' | 'flashing' | 'done';

/** Shared across header Kimi + hero subtitle so look-down tracks Thinking. */
const phase: Ref<HeroSequencePhase> = ref('idle');

export function useHeroSequence() {
  const isLookingDown = computed(
    () => phase.value === 'thinking' || phase.value === 'typing',
  );

  const setPhase = (next: HeroSequencePhase) => {
    phase.value = next;
  };

  return {
    phase,
    isLookingDown,
    setPhase,
  };
}
