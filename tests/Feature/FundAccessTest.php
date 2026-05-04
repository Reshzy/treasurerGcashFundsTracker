<?php

namespace Tests\Feature;

use App\Models\Fund;
use App\Models\Sender;
use App\Models\Transaction;
use App\Models\User;
use App\Services\FundTransactionDocxExporter;
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

    public function test_fund_show_includes_dynamic_category_totals(): void
    {
        $owner = $this->createAdminUser();

        $fund = Fund::create([
            'name' => 'Household Fund',
            'description' => 'Monthly spending',
            'created_by' => $owner->id,
        ]);
        $fund->members()->attach($owner->id, ['role' => 'owner']);

        $sender = Sender::create([
            'name' => 'Wallet',
            'type' => 'individual',
            'created_by' => $owner->id,
        ]);
        $sender->members()->attach(User::factory()->create(['email' => null]));

        Transaction::create([
            'fund_id' => $fund->id,
            'sender_id' => $sender->id,
            'amount' => 100,
            'date' => now(),
            'category' => 'Food',
            'created_by' => $owner->id,
        ]);
        Transaction::create([
            'fund_id' => $fund->id,
            'sender_id' => $sender->id,
            'amount' => 50,
            'date' => now(),
            'category' => 'Food',
            'created_by' => $owner->id,
        ]);
        Transaction::create([
            'fund_id' => $fund->id,
            'sender_id' => $sender->id,
            'amount' => 200,
            'date' => now(),
            'category' => 'Transport',
            'created_by' => $owner->id,
        ]);
        Transaction::create([
            'fund_id' => $fund->id,
            'sender_id' => $sender->id,
            'amount' => 30,
            'date' => now(),
            'category' => null,
            'created_by' => $owner->id,
        ]);

        $response = $this->actingAs($owner)->get(route('funds.show', $fund->id));

        $response->assertInertia(fn ($page) => $page
            ->component('Funds/Show')
            ->where('fund.total', 380)
            ->where('fund.category_totals.0.category', 'Transport')
            ->where('fund.category_totals.0.total', 200)
            ->where('fund.category_totals.1.category', 'Food')
            ->where('fund.category_totals.1.total', 150)
            ->where('fund.category_totals.2.category', 'Uncategorized')
            ->where('fund.category_totals.2.total', 30)
        );
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

    public function test_member_can_download_fund_transactions_docx_export(): void
    {
        $owner = $this->createAdminUser();
        $member = $this->createAdminUser();
        $groupMemberA = User::factory()->create(['name' => 'Alpha Member']);
        $groupMemberB = User::factory()->create(['name' => 'Beta Member']);

        $fund = Fund::create([
            'name' => 'Household Fund',
            'description' => 'Test',
            'created_by' => $owner->id,
        ]);
        $fund->members()->attach($owner->id, ['role' => 'owner']);
        $fund->members()->attach($member->id, ['role' => 'member']);

        $groupSender = Sender::create([
            'name' => 'Weekend Squad',
            'type' => 'group',
            'created_by' => $owner->id,
        ]);
        $groupSender->members()->sync([$groupMemberA->id, $groupMemberB->id]);

        Transaction::create([
            'fund_id' => $fund->id,
            'sender_id' => $groupSender->id,
            'amount' => 250,
            'date' => now()->subDay(),
            'notes' => 'Group purchase',
            'category' => 'Food',
            'created_by' => $owner->id,
        ]);

        $response = $this->actingAs($member)->get(route('funds.transactions.export', $fund));

        $response->assertOk();
        $response->assertDownload('household-fund-transactions-'.now()->format('Ymd').'.docx');
    }

    public function test_docx_export_contains_group_and_member_names(): void
    {
        $owner = $this->createAdminUser();
        $groupMemberA = User::factory()->create(['name' => 'Alpha Member']);
        $groupMemberB = User::factory()->create(['name' => 'Beta Member']);
        $individualUser = User::factory()->create(['name' => 'Solo Member']);

        $fund = Fund::create([
            'name' => 'Travel Fund',
            'description' => 'Trip budget',
            'created_by' => $owner->id,
        ]);
        $fund->members()->attach($owner->id, ['role' => 'owner']);

        $groupSender = Sender::create([
            'name' => 'Weekend Squad',
            'type' => 'group',
            'created_by' => $owner->id,
        ]);
        $groupSender->members()->sync([$groupMemberA->id, $groupMemberB->id]);

        $individualSender = Sender::create([
            'name' => 'Personal Wallet',
            'type' => 'individual',
            'created_by' => $owner->id,
        ]);
        $individualSender->members()->sync([$individualUser->id]);

        Transaction::create([
            'fund_id' => $fund->id,
            'sender_id' => $groupSender->id,
            'amount' => 500,
            'date' => now()->subDays(2),
            'notes' => 'Cab fare split',
            'category' => 'Transport',
            'created_by' => $owner->id,
        ]);

        Transaction::create([
            'fund_id' => $fund->id,
            'sender_id' => $individualSender->id,
            'amount' => 200,
            'date' => now()->subDay(),
            'notes' => 'Snacks',
            'category' => 'Food',
            'created_by' => $owner->id,
        ]);

        $path = app(FundTransactionDocxExporter::class)->export($fund, $owner);
        $this->assertFileExists($path);

        $zip = new \ZipArchive;
        $this->assertTrue($zip->open($path) === true);

        $documentXml = $zip->getFromName('word/document.xml');
        $headerXml = $zip->getFromName('word/header1.xml');
        $zip->close();

        $this->assertIsString($documentXml);
        $this->assertIsString($headerXml);
        $this->assertStringContainsString(config('app.name', 'Laravel').' Transaction Export', $headerXml);
        $this->assertStringContainsString('w:pgMar', $documentXml);
        $this->assertStringContainsString('w:top="720"', $documentXml);
        $this->assertStringContainsString('w:right="720"', $documentXml);
        $this->assertStringContainsString('w:bottom="720"', $documentXml);
        $this->assertStringContainsString('w:left="720"', $documentXml);
        $this->assertStringContainsString('w:header="360"', $documentXml);
        $this->assertStringContainsString('w:footer="360"', $documentXml);
        $this->assertStringContainsString('Weekend Squad', $documentXml);
        $this->assertStringContainsString('Alpha Member', $documentXml);
        $this->assertStringContainsString('Beta Member', $documentXml);
        $this->assertStringContainsString('Personal Wallet', $documentXml);

        unlink($path);
    }
}
