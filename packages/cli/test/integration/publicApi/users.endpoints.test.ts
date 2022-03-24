import express = require('express');
import validator from 'validator';
import { v4 as uuid } from 'uuid';
import { compare } from 'bcryptjs';

import { Db } from '../../../src';
import config = require('../../../config');
import { SUCCESS_RESPONSE_BODY } from './../shared/constants';
import { Role } from '../../../src/databases/entities/Role';
import {
	randomEmail,
	randomInvalidPassword,
	randomName,
	randomValidPassword,
} from './../shared/random';

import { CredentialsEntity } from '../../../src/databases/entities/CredentialsEntity';
import { WorkflowEntity } from '../../../src/databases/entities/WorkflowEntity';
import * as utils from './../shared/utils';
import * as testDb from './../shared/testDb';

let app: express.Application;
let testDbName = '';
let globalOwnerRole: Role;
let globalMemberRole: Role;
let workflowOwnerRole: Role;
let credentialOwnerRole: Role;

beforeAll(async () => {
	app = utils.initTestServer({ endpointGroups: ['publicApi'], applyAuth: false });
	const initResult = await testDb.init();
	testDbName = initResult.testDbName;

	const [
		fetchedGlobalOwnerRole,
		fetchedGlobalMemberRole,
		fetchedWorkflowOwnerRole,
		fetchedCredentialOwnerRole,
	] = await testDb.getAllRoles();

	globalOwnerRole = fetchedGlobalOwnerRole;
	globalMemberRole = fetchedGlobalMemberRole;
	workflowOwnerRole = fetchedWorkflowOwnerRole;
	credentialOwnerRole = fetchedCredentialOwnerRole;

	utils.initTestTelemetry();
	utils.initTestLogger();
});

beforeEach(async () => {
	// do not combine calls - shared tables must be cleared first and separately
	await testDb.truncate(['SharedCredentials', 'SharedWorkflow'], testDbName);
	await testDb.truncate(['User', 'Workflow', 'Credentials'], testDbName);

	jest.isolateModules(() => {
		jest.mock('../../config');
	});

	await testDb.createUser({
		id: INITIAL_TEST_USER.id,
		email: INITIAL_TEST_USER.email,
		password: INITIAL_TEST_USER.password,
		firstName: INITIAL_TEST_USER.firstName,
		lastName: INITIAL_TEST_USER.lastName,
		globalRole: globalOwnerRole,
	});

	config.set('userManagement.disabled', false);
	config.set('userManagement.isInstanceOwnerSetUp', true);
	config.set('userManagement.emails.mode', '');
});

afterAll(async () => {
	await testDb.terminate(testDbName);
});

test('GET /users should return all users', async () => {
	const owner = await Db.collections.User!.findOneOrFail();
	const authOwnerAgent = utils.createAgent(app, { auth: true, user: owner });

	await testDb.createUser();

	const response = await authOwnerAgent.get('/users');

	expect(response.statusCode).toBe(200);
	expect(response.body.data.length).toBe(2);

	for (const user of response.body.data) {
		const {
			id,
			email,
			firstName,
			lastName,
			personalizationAnswers,
			globalRole,
			password,
			resetPasswordToken,
			isPending,
		} = user;

		expect(validator.isUUID(id)).toBe(true);
		expect(email).toBeDefined();
		expect(firstName).toBeDefined();
		expect(lastName).toBeDefined();
		expect(personalizationAnswers).toBeUndefined();
		expect(password).toBeUndefined();
		expect(resetPasswordToken).toBeUndefined();
		expect(isPending).toBe(false);
		expect(globalRole).toBeDefined();
	}
});

const INITIAL_TEST_USER = {
	id: uuid(),
	email: randomEmail(),
	firstName: randomName(),
	lastName: randomName(),
	password: randomValidPassword(),
};

const INVALID_FILL_OUT_USER_PAYLOADS = [
	{
		firstName: randomName(),
		lastName: randomName(),
		password: randomValidPassword(),
	},
	{
		inviterId: INITIAL_TEST_USER.id,
		firstName: randomName(),
		password: randomValidPassword(),
	},
	{
		inviterId: INITIAL_TEST_USER.id,
		firstName: randomName(),
		password: randomValidPassword(),
	},
	{
		inviterId: INITIAL_TEST_USER.id,
		firstName: randomName(),
		lastName: randomName(),
	},
	{
		inviterId: INITIAL_TEST_USER.id,
		firstName: randomName(),
		lastName: randomName(),
		password: randomInvalidPassword(),
	},
];

const TEST_EMAILS_TO_CREATE_USER_SHELLS = [randomEmail(), randomEmail(), randomEmail()];
