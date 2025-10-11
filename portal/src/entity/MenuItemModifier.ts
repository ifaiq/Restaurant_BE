import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MenuItem } from './MenuItem';
import { Modifier } from './Modifiers';

@Entity()
export class MenuItemModifier {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => MenuItem, (item) => item.modifierLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'menuItemId' })
  menuItem!: MenuItem;

  @ManyToOne(() => Modifier, (mod) => mod.itemLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modifierId' })
  modifier!: Modifier;
}
