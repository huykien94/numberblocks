# Quantity-first learning design

This game takes inspiration from Montessori's progression from concrete quantities to symbols, one-to-one counting, equal grouping, repetition, and opportunities for self-correction. It is a digital adaptation, not a Montessori curriculum, certified material, or evidence that learning outcomes have improved. A child still benefits from real objects and adult observation.

## Reference status

The following organizations provide general Montessori background:

- Association Montessori Internationale: https://montessori-ami.org/about-montessori
- American Montessori Society: https://amshq.org/about-montessori/what-is-montessori/

Direct retrieval returned HTTP 403 in this development environment. These pages were not reviewed in this session and are not presented as sources verified for specific implementation details. The design below uses established general knowledge of Montessori materials and distinguishes our own interface choices. Source verification remains outstanding.

## Material ideas and digital adaptation

| Operation | Familiar material idea | Game adaptation |
| --- | --- | --- |
| Addition | Number rods, bead quantities and numeral cards connect quantities with symbols; quantities can be combined. | Two colored sets move into a single counting tray. Each block occupies one space. Color is preserved so the original two parts remain visible. |
| Subtraction | Taking a concrete quantity away from a larger quantity makes the remainder visible. | The original tray shows what remains; the removed blocks stay visible in a separate tray. Nothing disappears. Remaining plus removed always equals the original amount. |
| Multiplication | Equal bead groups and the multiplication bead board show repeated equal quantities. | Each group has the same number of blocks. Completed groups remain separated instead of collapsing into an undifferentiated pile. Text explains “b groups of a.” |
| Division | Sharing beads one at a time, as in division-board activities, connects the operation to equal shares. | Each friend receives one block in turn. Group counts are visible, and the question explicitly asks how many blocks **each friend** receives. |

The five/ten-space tray is our own visual counting scaffold; it is not described as a canonical Montessori material. Figures, stars, sound effects and multiple-choice answers are game features, not Montessori requirements.

## Interaction and progression

- Begin with quantities up to five; the operation menu can switch to quantities up to ten. Operands, results and answer choices stay within the selected range. Zero can occur as a subtraction result.
- Let the child touch and count. Demonstration remains optional. Physical pointing and moving one object per spoken count are useful activities away from the screen.
- The child's early-answer option and separate retry screen are retained, as explicitly requested by the parent. A new “Count together” button replays the same problem with visible manipulation; choosing a wrong answer does not require switching to a different problem.
- Answer positions stay fixed during a puzzle and are shuffled for a new puzzle. There is no timer or automatic difficulty escalation.
- Multiplication and division remain available, but adults should introduce them through small equal groups when the child is comfortable counting and comparing quantities, rather than requiring preschoolers to memorize facts.
- Keep praise and music optional. They should not replace the child's own observation that quantities match.

## Validation boundaries

Tests verify number bounds, correct quantities, equal groups, conservation of blocks during subtraction, and the interface's four operation flows in both ranges. These are software checks, not a study of child learning. A useful next validation is observing whether a child can describe what happened and repeat the operation using real blocks without guessing a screen position.
