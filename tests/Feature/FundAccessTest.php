<?php

namespace Tests\Feature;

use App\Models\Fund;
use App\Models\Sender;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FundAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function createAdminUser(array $attributes = []): User
    {
        return User::factory()->create(array_merge(['is_admin' => true], $attributes));
    }

    public function test_viewer_can_view_fund_but_cannot_edit(): void
    {
        $owner = $this->createAdminUser();
        $viewer = $this->createAdminUser();

        $fund = Fund::create([
            'name' => 'Test Fund',
            'description' => 'Test',
            'created_by' => $owner->id,
        ]);
        $fund->members()->attach($owner->id, ['role' => 'owner']);
        $fund->members()->attach($viewer->id, ['role' => 'viewer']);

        $response = $this->actingAs($viewer)->get(route('funds.show', $fund->id));
        $response->assertOk();

        $response = $this->actingAs($viewer)->get(route('funds.edit', $fund->id));
        $response->assertForbidden();
    }

    public function test_viewer_cannot_add_transactions(): void
    {
        $owner = $this->createAdminUser();
        $viewer = $this->createAdminUser();

        $fund = Fund::create([
            'name' => 'Test Fund',
            'description' => 'Test',
            'created_by' => $owner->id,
        ]);
        $fund->members()->attach($owner->id, ['role' => 'owner']);
        $fund->members()->attach($viewer->id, ['role' => 'viewer']);

        $sender = Sender::create([
            'name' => 'Test Sender',
            'type' => 'individual',
            'created_by' => $owner->id,
        ]);
        $sender->members()->attach(User::factory()->create(['email' => null]));

        $response = $this->actingAs($viewer)->post(route('transactions.store'), [
            'fund_id' => $fund->id,
            'sender_id' => $sender->id,
            'amount' => 100,
            'date' => now()->format('Y-m-d'),
        ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_viewer_cannot_edit_or_delete_transactions(): void
    {
        $owner = $this->createAdminUser();
        $viewer = $this->createAdminUser();

        $fund = Fund::create([
            'name' => 'Test Fund',
            'description' => 'Test',
            'created_by' => $owner->id,
        ]);
        $fund->members()->attach($owner->id, ['role' => 'owner']);
        $fund->members()->attach($viewer->id, ['role' => 'viewer']);

        $sender = Sender::create([
            'name' => 'Test Sender',
            'type' => 'individual',
            'created_by' => $owner->id,
        ]);
        $sender->members()->attach(User::factory()->create(['email' => null]));

        $transaction = Transaction::create([
            'fund_id' => $fund->id,
            'sender_id' => $sender->id,
            'amount' => 100,
            'date' => now(),
            'created_by' => $owner->id,
        ]);

        $response = $this->actingAs($viewer)->put(route('transactions.update', $transaction->id), [
            'sender_id' => $sender->id,
            'amount' => 200,
            'date' => now()->format('Y-m-d'),
            'notes' => null,
            'category' => null,
        ]);
        $response->assertForbidden();

        $response = $this->actingAs($viewer)->delete(route('transactions.destroy', $transaction->id));
        $response->assertForbidden();

        $this->assertDatabaseHas('transactions', ['id' => $transaction->id, 'amount' => 100]);
    }

    public function test_member_can_view_and_edit_fund_and_manage_transactions(): void
    {
        $owner = $this->createAdminUser();
        $member = $this->createAdminUser();

        $fund = Fund::create([
            'name' => 'Test Fund',
            'description' => 'Test',
            'created_by' => $owner->id,
        ]);
        $fund->members()->attach($owner->id, ['role' => 'owner']);
        $fund->members()->attach($member->id, ['role' => 'member']);

        $response = $this->actingAs($member)->get(route('funds.show', $fund->id));
        $response->assertOk();

        $response = $this->actingAs($member)->get(route('funds.edit', $fund->id));
        $response->assertOk();

        $response = $this->actingAs($member)->put(route('funds.update', $fund->id), [
            'name' => 'Updated Fund',
            'description' => 'Updated',
        ]);
        $response->assertRedirect(route('funds.show', $fund->id));
        $fund->refresh();
        $this->assertSame('Updated Fund', $fund->name);

        $sender = Sender::create([
            'name' => 'Test Sender',
            'type' => 'individual',
            'created_by' => $member->id,
        ]);
        $sender->members()->attach(User::factory()->create(['email' => null]));

        $response = $this->actingAs($member)->post(route('transactions.store'), [
            'fund_id' => $fund->id,
            'sender_id' => $sender->id,
            'amount' => 50,
            'date' => now()->format('Y-m-d'),
        ]);
        $response->assertRedirect(route('funds.show', $fund->id));
        $this->assertDatabaseHas('transactions', ['fund_id' => $fund->id, 'amount' => 50]);
    }

    public function test_owner_can_add_members_with_viewer_or_member_role(): void
    {
        $owner = $this->createAdminUser();
        $newUser = $this->createAdminUser();

        $fund = Fund::create([
            'name' => 'Test Fund',
            'description' => 'Test',
            'created_by' => $owner->id,
        ]);
        $fund->members()->attach($owner->id, ['role' => 'owner']);

        $response = $this->actingAs($owner)->post(route('funds.members.add', $fund->id), [
            'user_id' => $newUser->id,
            'role' => 'viewer',
        ]);
        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('fund_user', [
            'fund_id' => $fund->id,
            'user_id' => $newUser->id,
            'role' => 'viewer',
        ]);

        $anotherUser = $this->createAdminUser();
        $response = $this->actingAs($owner)->post(route('funds.members.add', $fund->id), [
            'user_id' => $anotherUser->id,
            'role' => 'member',
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('fund_user', [
            'fund_id' => $fund->id,
            'user_id' => $anotherUser->id,
            'role' => 'member',
        ]);
    }

    public function test_owner_can_remove_members(): void
    {
        $owner = $this->createAdminUser();
        $member = $this->createAdminUser();

        $fund = Fund::create([
            'name' => 'Test Fund',
            'description' => 'Test',
            'created_by' => $owner->id,
        ]);
        $fund->members()->attach($owner->id, ['role' => 'owner']);
        $fund->members()->attach($member->id, ['role' => 'member']);

        $response = $this->actingAs($owner)->delete(route('funds.members.remove', [$fund->id, $member->id]));
        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('fund_user', [
            'fund_id' => $fund->id,
            'user_id' => $member->id,
        ]);
    }

    public function test_member_cannot_add_or_remove_members(): void
    {
        $owner = $this->createAdminUser();
        $member = $this->createAdminUser();
        $newUser = $this->createAdminUser();

        $fund = Fund::create([
            'name' => 'Test Fund',
            'description' => 'Test',
            'created_by' => $owner->id,
        ]);
        $fund->members()->attach($owner->id, ['role' => 'owner']);
        $fund->members()->attach($member->id, ['role' => 'member']);

        $response = $this->actingAs($member)->post(route('funds.members.add', $fund->id), [
            'user_id' => $newUser->id,
            'role' => 'viewer',
        ]);
        $response->assertForbidden();

        $response = $this->actingAs($member)->delete(route('funds.members.remove', [$fund->id, $owner->id]));
        $response->assertForbidden();
    }

    public function test_user_without_access_cannot_view_fund(): void
    {
        $owner = $this->createAdminUser();
        $stranger = $this->createAdminUser();

        $fund = Fund::create([
            'name' => 'Test Fund',
            'description' => 'Test',
            'created_by' => $owner->id,
        ]);
        $fund->members()->attach($owner->id, ['role' => 'owner']);

        $response = $this->actingAs($stranger)->get(route('funds.show', $fund->id));
        $response->assertForbidden();
    }
}
