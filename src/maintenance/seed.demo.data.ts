import { FastifyInstance } from 'fastify';
import { User, UserRole } from '../features/user/user.types';
import { Hook } from '../features/hook/hook.types';
import { HookCategory, HookStatus } from '../features/hook/hook.types';
import { Widget, WidgetStatus } from '../features/widget/widget.types';
import { Partnership } from '../features/partnership/partnership.types';

const users: User[] = [
  { email: 'test_user_1@philadelphia.com', userId: 'test_user_1', role: UserRole.USER },
  { email: 'test_user_2@philadelphia.com', userId: 'test_user_2', role: UserRole.USER },
  { email: 'bogacz.jakub3@gmail.com', userId: 'user_2tAqwaWWl6n5HJRzWBlnYqpcKhc', role: UserRole.USER },
];

const hooks: Hook[] = [
  {
    category: HookCategory.BUSINESS,
    name: 'Philadelphian Demo',
    domain: 'https://philadelphian.example.com',
    status: HookStatus.ACTIVE,
    userId: 'user_2tAqwaWWl6n5HJRzWBlnYqpcKhc',
    widgetId: '',
    description: 'Philadelphian Demo is a demo website for Philadelphian.',
  },
  {
    category: HookCategory.BUSINESS,
    name: 'TechPartner Solutions',
    domain: 'https://techpartner.example.com',
    status: HookStatus.ACTIVE,
    userId: 'test_user_1',
    widgetId: '',
    description: 'TechPartner Solutions is a leading technology company that provides innovative solutions for businesses.',
  },
  {
    category: HookCategory.BUSINESS,
    name: 'Creative Design Studio',
    domain: 'https://creativedesign.example.com',
    status: HookStatus.ACTIVE,
    userId: 'test_user_1',
    widgetId: '',
    description: 'Creative Design Studio is a design agency that specializes in creating beautiful and functional websites.',
  },
  {
    category: HookCategory.BUSINESS,
    name: 'Marketing Gurus',
    domain: 'https://creativedesign.example.com',
    status: HookStatus.ACTIVE,
    userId: 'test_user_1',
    widgetId: '',
    description: 'Marketing Gurus is a digital marketing agency that helps businesses grow their online presence.',
  },
  {
    category: HookCategory.BUSINESS,
    name: 'Data Analytics Pro',
    domain: 'https://dataanalytics.example.com',
    status: HookStatus.ACTIVE,
    userId: 'test_user_1',
    widgetId: '',
    description: 'Data Analytics Pro is a data analytics company that helps businesses make better decisions with data.',
  },
  {
    category: HookCategory.BUSINESS,
    name: 'Security Shield',
    domain: 'https://securityshield.example.com',
    status: HookStatus.ACTIVE,
    userId: 'test_user_1',
    widgetId: '',
    description: 'Security Shield is a cybersecurity company that helps businesses protect their data and systems.',
  },
];

export async function seedDemoData(fastify: FastifyInstance): Promise<void> {
  await seedUsers(fastify);
  await seedHooks(fastify);
  await seedPartnerships('Vodka From Poland', fastify);
}

async function seedUsers(fastify: FastifyInstance) {
  const userRepository = fastify.repository.user;
  for (const user of users) {
    const dbUser = await userRepository.findByUserId(user.userId);
    if (!dbUser) {
      await userRepository.create(user);
      fastify.log.info('Seeded user: ' + JSON.stringify(user));
    }
  }
}

async function seedHooks(fastify: FastifyInstance) {
  const hookRepository = fastify.repository.hook;
  const hookService = fastify.service.hook;
  const widgetRepository = fastify.repository.widget;
  const widgetService = fastify.service.widget;
  for (const hook of hooks) {
    const dbHook = await hookRepository.queryOne({ name: hook.name });
    if (!dbHook) {
      const { _id } = await widgetService.register(hook.userId);
      let created: Hook | null = (await hookService.create({
        name: hook.name,
        category: hook.category,
        widgetId: _id?.toString() || '',
        userId: hook.userId,
        description: hook.description,
      })) as Hook;

      await widgetRepository.update(_id!, { status: WidgetStatus.ACTIVE } as Widget);
      created = await hookRepository.update(created._id!, { status: HookStatus.ACTIVE, domain: hook.domain } as Hook);
      fastify.log.info('Seeded hook: ' + JSON.stringify(created));
    }
  }
}

async function seedPartnerships(hookName: string, fastify: FastifyInstance): Promise<void> {
  const hookRepository = fastify.repository.hook;
  const widgetRepository = fastify.repository.widget;
  const partnershipRepository = fastify.repository.partnership;

  const sourceHook = await hookRepository.queryOne({ name: hookName });
  if (!sourceHook) {
    fastify.log.error('Hook not found:', hookName);
    return;
  }

  const sourceWidget = await widgetRepository.findById(sourceHook.widgetId);
  if (!sourceWidget) {
    fastify.log.error('Widget not found:', sourceHook.widgetId);
    return;
  }

  for (let targetHook of hooks) {
    if (targetHook.name === sourceHook.name) {
      continue;
    }

    targetHook = (await hookRepository.queryOne({ name: targetHook.name })) ?? targetHook;

    const targetWidget = await widgetRepository.findById(targetHook.widgetId);
    if (!targetWidget) {
      fastify.log.error('Widget not found:', targetHook.widgetId);
      continue;
    }

    const exists = await partnershipRepository.queryOne({ widgetKey: targetWidget.widgetKey });
    if (exists) {
      continue;
    }

    const partnership: Partnership = {
      sourceWidgetKey: sourceWidget.widgetKey,
      widgetKey: targetWidget.widgetKey,
      pageName: targetHook.name,
      pageUrl: targetHook.domain ?? '',
      pageDescription: targetHook.description ?? '',
    };

    const created = await partnershipRepository.create(partnership);
    fastify.log.info('Seeded partnership: ' + JSON.stringify(created));
  }
}
